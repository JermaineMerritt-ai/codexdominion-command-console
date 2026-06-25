import type {
  AuditEvent,
  Decision,
  ProcurementOpportunity,
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
}

/** Full result returned to the Command Workspace UI. */
export interface CommandResult extends CommandResultBody {
  ok: boolean;
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
