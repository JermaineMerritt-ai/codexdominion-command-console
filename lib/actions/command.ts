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
import { can, forbiddenMessage } from "@/lib/governance/rbac";
import { parseCommand } from "@/lib/command/intents";
import { deniedDecisions, runQuery, type CommandResult } from "@/lib/command/engine";

/** Execute a Command Workspace prompt: parse → authorize → run → audit. */
export async function executeCommand(prompt: string): Promise<CommandResult> {
  const parsed = parseCommand(prompt);

  const base = {
    intent: parsed.intent,
    intentLabel: parsed.label,
    entities: parsed.entities,
    prompt: parsed.prompt,
  };

  if (parsed.intent === "unsupported") {
    return {
      ...base,
      ok: false,
      error:
        "I can't interpret that yet. Try one of the suggested prompts below.",
      summary: "Unsupported command.",
      rows: [],
      recommendedActions: [],
      evidenceLinks: [],
      auditEventId: null,
    };
  }

  const actor = await getCurrentActor();

  // RBAC: privileged commands require a governance permission.
  if (parsed.permission && !can(actor.role, parsed.permission)) {
    try {
      await (await getMutations()).auditAuthorizationDenied(
        actor,
        `command:${parsed.intent}`,
        "command",
        parsed.intent,
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
      auditEventId: null,
    };
  }

  const [decisions, workflows, vendors, opportunities, auditEvents] =
    await Promise.all([
      getDecisions(),
      getWorkflows(),
      getVendors(),
      getOpportunities(),
      getAuditEvents(),
    ]);

  const mutations = await getMutations();

  // Privileged command: generate an evidence pack for denied decisions.
  if (parsed.intent === "generate_evidence_for_denied") {
    const denied = deniedDecisions(decisions);
    if (denied.length === 0) {
      const audit = await mutations.recordCommandAudit(actor, {
        intent: parsed.intent,
        prompt: parsed.prompt,
        summary: "No denied decisions to package.",
        afterState: { intent: parsed.intent, packaged: 0 },
      });
      revalidatePath("/settings");
      return {
        ...base,
        ok: true,
        summary: "No denied decisions found — nothing to package.",
        rows: [],
        recommendedActions: [],
        evidenceLinks: [],
        auditEventId: audit.id,
      };
    }
    const pack = await mutations.generateEvidencePackRecord(
      {
        title: `Denied Decisions Evidence Pack (${denied.length})`,
        decisionIds: denied.map((d) => d.id),
        formats: ["JSON", "PDF"],
      },
      actor,
    );
    const audit = await mutations.recordCommandAudit(actor, {
      intent: parsed.intent,
      prompt: parsed.prompt,
      summary: `Sealed ${pack.id} covering ${denied.length} denied decisions.`,
      afterState: { intent: parsed.intent, packId: pack.id, packaged: denied.length },
    });
    revalidatePath("/evidence");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return {
      ...base,
      ok: true,
      summary: `Sealed evidence pack ${pack.id} covering ${denied.length} denied decision${denied.length === 1 ? "" : "s"}.`,
      rows: denied.map((d) => ({
        id: d.id,
        title: d.aiSystem,
        subtitle: d.policyRule,
        badge: "denied",
        badgeStatus: "denied",
        href: "/evidence",
      })),
      recommendedActions: ["Distribute the sealed pack to examiners or auditors."],
      evidenceLinks: [
        { label: `Evidence pack ${pack.id}`, href: "/evidence" },
      ],
      auditEventId: audit.id,
    };
  }

  // Read-only commands.
  const body = runQuery(
    parsed,
    { decisions, workflows, vendors, opportunities, auditEvents },
    new Date(),
  );
  const audit = await mutations.recordCommandAudit(actor, {
    intent: parsed.intent,
    prompt: parsed.prompt,
    summary: body.summary,
    afterState: {
      intent: parsed.intent,
      entities: parsed.entities,
      resultCount: body.rows.length,
    },
  });
  revalidatePath("/settings");

  return { ...base, ok: true, ...body, auditEventId: audit.id };
}
