import type {
  AuditEvent,
  Decision,
  ProcurementOpportunity,
  RiskLevel,
  Vendor,
  Workflow,
} from "@/types";
import type { CommandIntent, ParsedCommand } from "./intents";

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
