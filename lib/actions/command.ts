"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/actor";
import {
  getAuditEvents,
  getDecisions,
  getOpportunities,
  getVendors,
  getWorkflows,
} from "@/lib/data/queries";
import { getMutations } from "@/lib/data/mutations";
import { getModules, getModuleAliases } from "@/lib/modules/registry";
import { getKnowledgeGraph } from "@/lib/knowledge/registry";
import { can, forbiddenMessage } from "@/lib/governance/rbac";
import { computeEvidenceHash } from "@/lib/governance/audit";
import { parseCommand } from "@/lib/command/intents";
import {
  deniedDecisions,
  runQuery,
  type CommandData,
  type CommandResult,
} from "@/lib/command/engine";
import { getProvider } from "@/lib/providers/registry";

function makeCommandId(prompt: string, providerId: string, intent: string): string {
  return (
    "CMD-" +
    computeEvidenceHash({ prompt, providerId, intent }).slice(2, 10).toUpperCase()
  );
}

/**
 * Execute a Command Workspace prompt. CodexDominion governs the request first
 * (parse → RBAC → audit), then routes execution to the selected provider.
 * Codex is always the governing layer; other providers are execution assistants.
 */
export async function executeCommand(
  prompt: string,
  providerId = "codex",
  locale = "en",
): Promise<CommandResult> {
  const parsed = parseCommand(prompt);
  const provider = getProvider(providerId);
  const commandId = makeCommandId(prompt, provider.id, parsed.intent);
  // Language-access metadata for the audit trail (governance is unchanged).
  const langMeta = {
    inputLanguage: parsed.language,
    responseLanguage: locale,
    originalPrompt: prompt,
    canonicalIntent: parsed.intent,
  };

  const base = {
    commandId,
    provider: provider.id,
    providerLabel: provider.name,
    intent: parsed.intent,
    intentLabel: parsed.label,
    entities: parsed.entities,
    prompt: parsed.prompt,
  };

  if (parsed.intent === "unsupported") {
    return {
      ...base,
      ok: false,
      error: "I can't interpret that yet. Try one of the suggested prompts below.",
      summary: "Unsupported command.",
      rows: [],
      recommendedActions: [],
      evidenceLinks: [],
      riskLevel: "low",
      auditEventId: null,
    };
  }

  const actor = await getCurrentActor();
  const mutations = await getMutations();

  // CodexDominion RBAC — enforced before any provider routing.
  if (parsed.permission && !can(actor.role, parsed.permission)) {
    try {
      await mutations.auditAuthorizationDenied(
        actor,
        `command:${parsed.intent}`,
        "command",
        commandId,
      );
      revalidatePath("/settings");
    } catch {
      /* never fail the response on an audit-write error */
    }
    return {
      ...base,
      ok: false,
      error: forbiddenMessage(actor.role, parsed.permission),
      summary: "Blocked by access control.",
      rows: [],
      recommendedActions: [],
      evidenceLinks: [],
      riskLevel: "low",
      auditEventId: null,
    };
  }

  const [decisions, workflows, vendors, opportunities, auditEvents, modules] =
    await Promise.all([
      getDecisions(),
      getWorkflows(),
      getVendors(),
      getOpportunities(),
      getAuditEvents(),
      getModules(),
    ]);
  const data: CommandData = {
    decisions,
    workflows,
    vendors,
    opportunities,
    auditEvents,
    modules,
    moduleAliases: getModuleAliases(),
  };

  // Organization knowledge graph — answered from governed context.
  if (parsed.intent === "show_organization_knowledge") {
    const graph = await getKnowledgeGraph();
    const summary = `CodexDominion governs ${graph.stats.totalNodes} entities across ${graph.stats.totalEdges} relationships, with ${graph.stats.totalGaps} open knowledge gap${graph.stats.totalGaps === 1 ? "" : "s"}.`;
    const audit = await mutations.recordCommandAudit(actor, {
      intent: parsed.intent,
      prompt: parsed.prompt,
      summary,
      afterState: { nodes: graph.stats.totalNodes, edges: graph.stats.totalEdges, gaps: graph.stats.totalGaps, ...langMeta },
    });
    revalidatePath("/settings");
    return {
      ...base,
      ok: true,
      summary,
      rows: graph.gaps.slice(0, 6).map((g) => ({
        id: g.id,
        title: g.label,
        subtitle: g.detail,
        badge: g.severity,
        badgeStatus: g.severity,
        href: g.href,
      })),
      recommendedActions: graph.gaps.length
        ? ["Resolve the highest-severity knowledge gaps first."]
        : [],
      evidenceLinks: [{ label: "Open Knowledge Graph", href: "/knowledge" }],
      riskLevel: graph.gaps.some((g) => g.severity === "critical")
        ? "critical"
        : graph.gaps.some((g) => g.severity === "high")
          ? "high"
          : "low",
      auditEventId: audit.id,
    };
  }

  // Provider not connected → governed, parsed, audited, but not executed.
  if (!provider.connected) {
    const exec = await provider.executeCommand({ parsed, data, now: new Date() });
    const audit = await mutations.recordCommandAudit(actor, {
      intent: parsed.intent,
      prompt: parsed.prompt,
      summary: `Routed to ${provider.name} (not connected).`,
      afterState: { intent: parsed.intent, provider: provider.id, executed: false, ...langMeta },
    });
    revalidatePath("/settings");
    return {
      ...base,
      ok: true,
      summary: exec.notice ?? `${provider.name} is not connected yet.`,
      rows: [],
      recommendedActions: [],
      evidenceLinks: [],
      riskLevel: "low",
      nextStep: `Connect ${provider.name} to enable execution.`,
      auditEventId: audit.id,
    };
  }

  // Codex (connected): governed mutation for evidence; otherwise provider query.
  if (parsed.intent === "generate_evidence_for_denied") {
    const denied = deniedDecisions(decisions);
    const summary = denied.length
      ? `Sealed an evidence pack covering ${denied.length} denied decision${denied.length === 1 ? "" : "s"}.`
      : "No denied decisions found — nothing to package.";
    let evidenceLinks: { label: string; href: string }[] = [];
    let rows = denied.map((d) => ({
      id: d.id,
      title: d.aiSystem,
      subtitle: d.policyRule,
      badge: "denied",
      badgeStatus: "denied",
      href: "/evidence",
    }));
    if (denied.length) {
      const pack = await mutations.generateEvidencePackRecord(
        {
          title: `Denied Decisions Evidence Pack (${denied.length})`,
          decisionIds: denied.map((d) => d.id),
          formats: ["JSON", "PDF"],
        },
        actor,
      );
      evidenceLinks = [{ label: `Evidence pack ${pack.id}`, href: "/evidence" }];
    } else {
      rows = [];
    }
    const audit = await mutations.recordCommandAudit(actor, {
      intent: parsed.intent,
      prompt: parsed.prompt,
      summary,
      afterState: { intent: parsed.intent, provider: provider.id, packaged: denied.length, ...langMeta },
    });
    revalidatePath("/evidence");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return {
      ...base,
      ok: true,
      summary,
      rows,
      recommendedActions: denied.length
        ? ["Distribute the sealed pack to examiners or auditors."]
        : [],
      evidenceLinks,
      riskLevel: denied.length ? "medium" : "low",
      nextStep: denied.length ? "Open Evidence to export the pack." : undefined,
      auditEventId: audit.id,
    };
  }

  const exec = await provider.executeCommand({ parsed, data, now: new Date() });
  const body = exec.body!;
  const audit = await mutations.recordCommandAudit(actor, {
    intent: parsed.intent,
    prompt: parsed.prompt,
    summary: body.summary,
    afterState: {
      intent: parsed.intent,
      provider: provider.id,
      resultCount: body.rows.length,
      riskLevel: body.riskLevel ?? "low",
      ...langMeta,
    },
  });
  revalidatePath("/settings");

  return {
    ...base,
    ok: true,
    ...body,
    riskLevel: body.riskLevel ?? "low",
    auditEventId: audit.id,
  };
}
