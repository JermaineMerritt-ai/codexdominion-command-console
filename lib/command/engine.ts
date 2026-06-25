import type {
  AuditEvent,
  Decision,
  ProcurementOpportunity,
  RiskLevel,
  Vendor,
  Workflow,
} from "@/types";
import type { CommandIntent, ParsedCommand } from "./intents";
import {
  findModuleByText,
  highestRiskModule,
  nextIntegrationModule,
  type ModuleSource,
  type ModuleView,
} from "@/lib/modules/contract";

export interface CommandRow {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeStatus?: string;
  href?: string;
}

export interface CommandResultBody {
  summary: string;
  rows: CommandRow[];
  recommendedActions: string[];
  evidenceLinks: { label: string; href: string }[];
  riskLevel?: RiskLevel;
  nextStep?: string;
  /** Multi-step plan for composite commands (orchestration view). */
  plan?: string[];
  /** Data provenance for live-module commands. */
  source?: ModuleSource;
}

/** Full result returned to the Command Workspace UI. */
export interface CommandResult extends CommandResultBody {
  ok: boolean;
  commandId: string;
  provider: string;
  providerLabel: string;
  intent: CommandIntent;
  intentLabel: string;
  entities: Record<string, string>;
  prompt: string;
  auditEventId: string | null;
  error?: string;
}

export interface CommandData {
  decisions: Decision[];
  workflows: Workflow[];
  vendors: Vendor[];
  opportunities: ProcurementOpportunity[];
  auditEvents: AuditEvent[];
  modules?: ModuleView[];
  moduleAliases?: Record<string, string[]>;
}

function moduleRow(m: ModuleView): CommandRow {
  return {
    id: m.id,
    title: m.name,
    subtitle: `${m.category} · ${m.health} · ${m.integrationMaturity}% integrated`,
    badge: m.status,
    badgeStatus: m.status,
    href: `/modules/${m.id}`,
  };
}

const DAY = 86400000;

export function expiringVendors(vendors: Vendor[], now: Date): Vendor[] {
  return vendors.filter(
    (v) =>
      v.status === "expiring" ||
      v.insurance === "expired" ||
      v.securityReview === "expired" ||
      (new Date(v.contractExpiresAt).getTime() - now.getTime()) / DAY <= 30,
  );
}

export function deniedDecisions(decisions: Decision[]): Decision[] {
  return decisions.filter((d) => d.outcome === "denied");
}

/**
 * Execute a read-only (query/explain) command against in-memory data.
 * Pure and deterministic — `now` is injected so results are testable.
 */
export function runQuery(
  parsed: ParsedCommand,
  data: CommandData,
  now: Date,
): CommandResultBody {
  switch (parsed.intent) {
    case "show_high_risk_decisions": {
      const rows = data.decisions
        .filter((d) => d.riskLevel === "high" || d.riskLevel === "critical")
        .map<CommandRow>((d) => ({
          id: d.id,
          title: d.aiSystem,
          subtitle: d.policyRule,
          badge: d.riskLevel,
          badgeStatus: d.riskLevel,
          href: "/decisions",
        }));
      return {
        summary: `${rows.length} high-risk decision${rows.length === 1 ? "" : "s"} found.`,
        rows,
        recommendedActions: rows.length
          ? ["Review each high-risk decision and approve or deny it."]
          : [],
        evidenceLinks: [{ label: "Open Decision Center", href: "/decisions" }],
      };
    }

    case "show_pending_approvals": {
      const rows = data.workflows
        .filter((w) => w.state === "pending_review" || w.state === "escalated")
        .map<CommandRow>((w) => ({
          id: w.id,
          title: w.name,
          subtitle: w.aiSystem,
          badge: w.state,
          badgeStatus: w.state,
          href: "/workflows",
        }));
      return {
        summary: `${rows.length} workflow${rows.length === 1 ? "" : "s"} awaiting review.`,
        rows,
        recommendedActions: rows.length
          ? ["Transition pending workflows or escalate as needed."]
          : [],
        evidenceLinks: [{ label: "Open Workflows", href: "/workflows" }],
      };
    }

    case "show_expiring_vendors": {
      const rows = expiringVendors(data.vendors, now).map<CommandRow>((v) => ({
        id: v.id,
        title: v.name,
        subtitle: v.category,
        badge: v.status,
        badgeStatus: v.status,
        href: "/vendors",
      }));
      return {
        summary: `${rows.length} vendor${rows.length === 1 ? "" : "s"} with expiring or lapsed certifications.`,
        rows,
        recommendedActions: rows.length
          ? ["Complete vendor reviews and renew lapsing certifications."]
          : [],
        evidenceLinks: [{ label: "Open Vendor Governance", href: "/vendors" }],
      };
    }

    case "show_high_match_opportunities": {
      const rows = data.opportunities
        .filter((o) => o.matchScore >= 80)
        .map<CommandRow>((o) => ({
          id: o.id,
          title: o.name,
          subtitle: o.agency,
          badge: `${o.matchScore}% match`,
          href: `/procurement/${o.id}`,
        }));
      return {
        summary: `${rows.length} opportunit${rows.length === 1 ? "y" : "ies"} with a match score ≥ 80.`,
        rows,
        recommendedActions: rows.length
          ? ["Build capture plans for the highest-match opportunities."]
          : [],
        evidenceLinks: [{ label: "Open Procurement", href: "/procurement" }],
      };
    }

    case "explain_decision": {
      const id = parsed.entities.entityId;
      const d = id ? data.decisions.find((x) => x.id === id) : undefined;
      if (!d) {
        return {
          summary: id
            ? `Decision ${id} was not found.`
            : "Specify a decision id, e.g. “Explain why DEC-2026-0480 was denied”.",
          rows: [],
          recommendedActions: [],
          evidenceLinks: [],
        };
      }
      return {
        summary: `Decision ${d.id} (${d.aiSystem}) was ${d.outcome}. Policy rule: ${d.policyRule}. Rationale: ${d.rationale}`,
        rows: [
          {
            id: d.id,
            title: `${d.aiSystem} — ${d.outcome}`,
            subtitle: d.rationale,
            badge: d.riskLevel,
            badgeStatus: d.riskLevel,
            href: "/decisions",
          },
        ],
        recommendedActions:
          d.outcome === "flagged" || d.outcome === "escalated"
            ? ["This decision is still actionable — approve or deny it."]
            : [],
        evidenceLinks: [
          { label: "Open Decision Center", href: "/decisions" },
        ],
      };
    }

    case "show_audit_events": {
      const id = parsed.entities.entityId;
      if (!id) {
        return {
          summary:
            "Specify an entity id, e.g. “Show audit events for DEC-2026-0480”.",
          rows: [],
          recommendedActions: [],
          evidenceLinks: [{ label: "Open Audit Trail", href: "/settings" }],
        };
      }
      const rows = data.auditEvents
        .filter((e) => e.target === id || e.entityId === id)
        .map<CommandRow>((e) => ({
          id: e.id,
          title: e.type,
          subtitle: e.summary,
          href: "/settings",
        }));
      return {
        summary: `${rows.length} audit event${rows.length === 1 ? "" : "s"} for ${id}.`,
        rows,
        recommendedActions: [],
        evidenceLinks: [{ label: "Open Audit Trail", href: "/settings" }],
      };
    }

    case "prepare_buyer_demo_summary": {
      const highRisk = data.decisions.filter(
        (d) => d.riskLevel === "high" || d.riskLevel === "critical",
      ).length;
      const pending = data.workflows.filter(
        (w) => w.state === "pending_review" || w.state === "escalated",
      ).length;
      const highRiskVendors = data.vendors.filter((v) => v.riskScore >= 60).length;
      const strongOpps = data.opportunities.filter((o) => o.matchScore >= 80).length;
      const rows: CommandRow[] = [
        { id: "m1", title: "Total AI decisions governed", subtitle: String(data.decisions.length) },
        { id: "m2", title: "High-risk decisions", subtitle: String(highRisk) },
        { id: "m3", title: "Workflows awaiting review", subtitle: String(pending) },
        { id: "m4", title: "High-risk vendors", subtitle: String(highRiskVendors) },
        { id: "m5", title: "High-match opportunities", subtitle: String(strongOpps) },
      ];
      return {
        summary: `Demo-ready: ${data.decisions.length} governed decisions, ${highRisk} high-risk, ${pending} awaiting review. The console demonstrates visibility → action → authority → governed command → proof.`,
        rows,
        plan: [
          "Gather governance metrics",
          "Summarize current posture",
          "Outline the 5-minute buyer demo flow",
        ],
        recommendedActions: [
          "Dashboard — governance visibility",
          "Decisions — approve/deny an AI action",
          "Command — run a governed command",
          "Evidence — generate an audit pack",
          "Vendors — show expiring compliance",
        ],
        evidenceLinks: [
          { label: "Open Dashboard", href: "/dashboard" },
          { label: "Demo script", href: "/dashboard" },
        ],
        riskLevel: "low",
        nextStep: "Start the demo on the Dashboard, then run a command here.",
      };
    }

    case "review_system_risk_posture": {
      const critical = data.decisions.filter((d) => d.riskLevel === "critical");
      const high = data.decisions.filter((d) => d.riskLevel === "high");
      const escalated = data.workflows.filter((w) => w.state === "escalated");
      const riskyVendors = data.vendors.filter((v) => v.riskScore >= 60);
      const level: RiskLevel =
        critical.length || escalated.length
          ? "critical"
          : high.length || riskyVendors.length
            ? "high"
            : "low";
      const rows: CommandRow[] = [
        ...critical.map<CommandRow>((d) => ({
          id: d.id,
          title: `${d.aiSystem} — critical decision`,
          subtitle: d.policyRule,
          badge: "critical",
          badgeStatus: "critical",
          href: "/decisions",
        })),
        ...escalated.map<CommandRow>((w) => ({
          id: w.id,
          title: `${w.name} — escalated`,
          subtitle: w.aiSystem,
          badge: "escalated",
          badgeStatus: "escalated",
          href: "/workflows",
        })),
        ...riskyVendors.map<CommandRow>((v) => ({
          id: v.id,
          title: `${v.name} — high vendor risk`,
          subtitle: `Risk score ${v.riskScore}`,
          badge: v.status,
          badgeStatus: v.status,
          href: "/vendors",
        })),
      ];
      return {
        summary: `Overall posture: ${level.toUpperCase()}. ${critical.length} critical + ${high.length} high-risk decisions, ${escalated.length} escalated workflow(s), ${riskyVendors.length} high-risk vendor(s).`,
        rows,
        recommendedActions: rows.length
          ? ["Resolve the highest-severity items first (critical, then escalated)."]
          : ["Posture is healthy — no critical items open."],
        evidenceLinks: [
          { label: "Open Dashboard", href: "/dashboard" },
          { label: "Open Decisions", href: "/decisions" },
        ],
        riskLevel: level,
        nextStep: critical.length
          ? `Review critical decision ${critical[0].id}.`
          : escalated.length
            ? `Resolve escalated workflow ${escalated[0].name}.`
            : "Maintain current controls.",
      };
    }

    case "recommend_next_governance_action": {
      const escalated = data.workflows.find((w) => w.state === "escalated");
      const flagged = data.decisions.find((d) => d.outcome === "flagged");
      const expiring = expiringVendors(data.vendors, now)[0];
      let nextStep: string;
      let row: CommandRow | null = null;
      let level: RiskLevel = "low";
      if (escalated) {
        nextStep = `Resolve escalated workflow "${escalated.name}".`;
        row = { id: escalated.id, title: escalated.name, subtitle: escalated.aiSystem, badge: "escalated", badgeStatus: "escalated", href: "/workflows" };
        level = "critical";
      } else if (flagged) {
        nextStep = `Review flagged decision ${flagged.id} and approve or deny it.`;
        row = { id: flagged.id, title: flagged.aiSystem, subtitle: flagged.policyRule, badge: "flagged", badgeStatus: "flagged", href: "/decisions" };
        level = "high";
      } else if (expiring) {
        nextStep = `Complete the vendor review for ${expiring.name}.`;
        row = { id: expiring.id, title: expiring.name, subtitle: expiring.category, badge: expiring.status, badgeStatus: expiring.status, href: "/vendors" };
        level = "medium";
      } else {
        nextStep = "Generate an evidence pack to stay audit-ready.";
      }
      return {
        summary: `Recommended next action: ${nextStep}`,
        rows: row ? [row] : [],
        recommendedActions: [nextStep],
        evidenceLinks: [],
        riskLevel: level,
        nextStep,
      };
    }

    case "show_active_modules": {
      const mods = (data.modules ?? []).filter((m) => m.status === "active");
      return {
        summary: `${mods.length} active module${mods.length === 1 ? "" : "s"} reporting into the Console.`,
        rows: mods.map(moduleRow),
        recommendedActions: [],
        evidenceLinks: [{ label: "Open Module Registry", href: "/modules" }],
        riskLevel: "low",
      };
    }

    case "show_modules_needing_integration": {
      const mods = (data.modules ?? []).filter(
        (m) => m.status === "needs_integration" || m.status === "planned",
      );
      const next = nextIntegrationModule(data.modules ?? []);
      return {
        summary: `${mods.length} module${mods.length === 1 ? "" : "s"} not yet fully governed.`,
        rows: mods.map(moduleRow),
        recommendedActions: mods.map(
          (m) => `${m.name}: ${m.recommendedNextStep}`,
        ),
        evidenceLinks: [{ label: "Open Module Registry", href: "/modules" }],
        riskLevel: "medium",
        nextStep: next ? `Start with ${next.name} (${next.integrationMaturity}% integrated).` : undefined,
      };
    }

    case "show_highest_risk_module": {
      const m = highestRiskModule(data.modules ?? []);
      if (!m) {
        return { summary: "No modules registered.", rows: [], recommendedActions: [], evidenceLinks: [] };
      }
      const level: RiskLevel = m.metrics.riskFlags >= 2 ? "critical" : m.metrics.riskFlags === 1 ? "high" : "low";
      return {
        summary: `${m.name} carries the most governance risk: ${m.metrics.riskFlags} risk flag(s), ${m.integrationMaturity}% integrated, health ${m.health}.`,
        rows: [moduleRow(m), ...m.riskItems.map<CommandRow>((r) => ({ id: r.id, title: r.label, subtitle: "Risk item", badge: r.level, badgeStatus: r.level }))],
        recommendedActions: [m.recommendedNextStep],
        evidenceLinks: [{ label: `Open ${m.name}`, href: `/modules/${m.id}` }],
        riskLevel: level,
        nextStep: m.recommendedNextStep,
      };
    }

    case "show_module_status": {
      const m = findModuleByText(
        data.modules ?? [],
        data.moduleAliases ?? {},
        parsed.prompt,
      );
      if (!m) {
        const names = (data.modules ?? []).map((x) => x.name).slice(0, 5).join(", ");
        return {
          summary: `Specify a module, e.g. "Show module status for ComplianceFlow". Known: ${names}…`,
          rows: [],
          recommendedActions: [],
          evidenceLinks: [{ label: "Open Module Registry", href: "/modules" }],
        };
      }
      const level: RiskLevel =
        m.health === "offline" ? "critical" : m.health === "degraded" ? "high" : "low";
      return {
        summary: `${m.name} — ${m.status.replace("_", " ")}, health ${m.health}, ${m.integrationMaturity}% integrated. Workflows ${m.metrics.activeWorkflows}, decisions ${m.metrics.openDecisions}, evidence ${m.metrics.evidenceItems}, risk flags ${m.metrics.riskFlags}.`,
        rows: [moduleRow(m)],
        recommendedActions: [m.recommendedNextStep],
        evidenceLinks: [{ label: `Open ${m.name}`, href: `/modules/${m.id}` }],
        riskLevel: level,
        nextStep: m.recommendedNextStep,
      };
    }

    case "recommend_next_module_integration": {
      const m = nextIntegrationModule(data.modules ?? []);
      if (!m) {
        return {
          summary: "All modules are active — nothing pending integration.",
          rows: [],
          recommendedActions: [],
          evidenceLinks: [{ label: "Open Module Registry", href: "/modules" }],
          riskLevel: "low",
        };
      }
      const step = `Integrate ${m.name} next — it is the closest to done at ${m.integrationMaturity}%. ${m.recommendedNextStep}`;
      return {
        summary: step,
        rows: [moduleRow(m)],
        recommendedActions: [m.recommendedNextStep],
        evidenceLinks: [{ label: `Open ${m.name}`, href: `/modules/${m.id}` }],
        riskLevel: "medium",
        nextStep: step,
      };
    }

    case "sync_control_plane":
    case "show_control_plane_health":
    case "show_live_control_plane_decisions":
    case "show_control_plane_audit_events": {
      const cp = (data.modules ?? []).find(
        (m) => m.id === "codex-control-plane",
      );
      if (!cp) {
        return {
          summary: "The codex-control-plane module is not registered.",
          rows: [],
          recommendedActions: [],
          evidenceLinks: [],
        };
      }
      const src = cp.source;
      const link = { label: "Open codex-control-plane", href: "/modules/codex-control-plane" };
      const degraded = src?.connection === "degraded";
      const provenance = src
        ? `Source: ${src.source}${src.latencyMs != null ? ` · ${src.latencyMs}ms` : ""}${src.lastError ? ` · error: ${src.lastError}` : ""}.`
        : "Source: seed_data.";

      if (parsed.intent === "show_live_control_plane_decisions") {
        return {
          summary: `${cp.decisions.length} control-plane decision${cp.decisions.length === 1 ? "" : "s"}. ${provenance}`,
          rows: cp.decisions.map<CommandRow>((d) => ({
            id: d.id,
            title: d.summary,
            subtitle: `outcome: ${d.outcome}`,
            badge: d.riskLevel,
            badgeStatus: d.riskLevel,
            href: "/modules/codex-control-plane",
          })),
          recommendedActions: [],
          evidenceLinks: [link],
          riskLevel: degraded ? "high" : "low",
          source: src,
        };
      }

      if (parsed.intent === "show_control_plane_audit_events") {
        return {
          summary: `${cp.auditEvents.length} control-plane audit event${cp.auditEvents.length === 1 ? "" : "s"}. ${provenance}`,
          rows: cp.auditEvents.map<CommandRow>((a) => ({
            id: a.id,
            title: a.type,
            subtitle: a.summary,
            href: "/modules/codex-control-plane",
          })),
          recommendedActions: [],
          evidenceLinks: [link],
          riskLevel: degraded ? "high" : "low",
          source: src,
        };
      }

      // sync_control_plane + show_control_plane_health share a status summary.
      const conn = src?.connection ?? "demo";
      const summary =
        conn === "connected"
          ? `Control plane is LIVE (connected). ${provenance}`
          : conn === "degraded"
            ? `Control plane live sync FAILED — using seed fallback. ${provenance}`
            : conn === "live_ready"
              ? `Control plane is live-ready (API configured, mode=demo). ${provenance}`
              : `Control plane running on demo seed data. Set CODEX_CONTROL_PLANE_MODE=live to connect. ${provenance}`;
      return {
        summary,
        rows: [moduleRow(cp)],
        recommendedActions:
          conn === "degraded"
            ? ["Check CODEX_CONTROL_PLANE_API_URL and upstream availability."]
            : conn === "demo"
              ? ["Configure CODEX_CONTROL_PLANE_API_URL and set mode=live."]
              : [],
        evidenceLinks: [link],
        riskLevel: degraded ? "high" : "low",
        nextStep:
          conn === "connected"
            ? "Live data is flowing — explore decisions and audit events."
            : "Bind the live API to replace seed data.",
        source: src,
      };
    }

    default:
      return {
        summary:
          "Unsupported command. Try one of the suggested prompts below.",
        rows: [],
        recommendedActions: [],
        evidenceLinks: [],
      };
  }
}
