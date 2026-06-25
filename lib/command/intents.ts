import type { GovernanceAction } from "@/lib/governance/rbac";

/** Supported command intents (deterministic — no LLM). */
export type CommandIntent =
  | "show_high_risk_decisions"
  | "show_pending_approvals"
  | "generate_evidence_for_denied"
  | "show_expiring_vendors"
  | "show_high_match_opportunities"
  | "explain_decision"
  | "show_audit_events"
  | "prepare_buyer_demo_summary"
  | "review_system_risk_posture"
  | "recommend_next_governance_action"
  | "show_active_modules"
  | "show_modules_needing_integration"
  | "show_highest_risk_module"
  | "show_module_status"
  | "recommend_next_module_integration"
  | "sync_control_plane"
  | "show_control_plane_health"
  | "show_live_control_plane_decisions"
  | "show_control_plane_audit_events"
  | "sync_complianceflow"
  | "show_complianceflow_health"
  | "show_complianceflow_decisions"
  | "show_complianceflow_audit_events"
  | "unsupported";

export interface IntentDefinition {
  intent: CommandIntent;
  label: string;
  /** Permission required to run it; null = read-only query (any role). */
  permission: GovernanceAction | null;
  patterns: RegExp[];
  sample: string;
}

// Recognized entity id formats across the platform.
const ID_PATTERN =
  /\b(DEC-\d{4}-\d{4}|EVP-[A-Z0-9-]+|AUD-[A-Za-z0-9]+|wf_\d+|ven_\w+|pol_\w+|usr_\w+)\b/i;

// Order matters: more specific intents are matched first.
export const INTENT_DEFINITIONS: IntentDefinition[] = [
  {
    intent: "sync_complianceflow",
    label: "Sync ComplianceFlow",
    permission: "sync_complianceflow",
    patterns: [/sync.*compliance ?flow/i, /compliance ?flow.*sync/i],
    sample: "Sync ComplianceFlow",
  },
  {
    intent: "show_complianceflow_health",
    label: "Show ComplianceFlow health",
    permission: "view_complianceflow",
    patterns: [/compliance ?flow.*health/i, /health.*compliance ?flow/i],
    sample: "Show ComplianceFlow health",
  },
  {
    intent: "show_complianceflow_decisions",
    label: "Show ComplianceFlow decisions",
    permission: "view_complianceflow",
    patterns: [/compliance ?flow.*decision/i],
    sample: "Show ComplianceFlow decisions",
  },
  {
    intent: "show_complianceflow_audit_events",
    label: "Show ComplianceFlow audit events",
    permission: "view_complianceflow",
    patterns: [/compliance ?flow.*audit/i],
    sample: "Show ComplianceFlow audit events",
  },
  {
    intent: "sync_control_plane",
    label: "Sync control plane",
    permission: "sync_control_plane",
    patterns: [/sync.*control[\s-]?plane/i, /control[\s-]?plane.*sync/i],
    sample: "Sync control plane",
  },
  {
    intent: "show_control_plane_health",
    label: "Show control plane health",
    permission: "view_control_plane",
    patterns: [/control[\s-]?plane.*health/i, /health.*control[\s-]?plane/i],
    sample: "Show control plane health",
  },
  {
    intent: "show_live_control_plane_decisions",
    label: "Show live control plane decisions",
    permission: "view_control_plane",
    patterns: [/control[\s-]?plane.*decision/i, /live.*decision/i],
    sample: "Show live control plane decisions",
  },
  {
    intent: "show_control_plane_audit_events",
    label: "Show control plane audit events",
    permission: "view_control_plane",
    patterns: [/control[\s-]?plane.*audit/i],
    sample: "Show control plane audit events",
  },
  {
    intent: "explain_decision",
    label: "Explain decision",
    permission: null,
    patterns: [/\bexplain\b/i, /\bwhy\b.*\b(deni|approv|flag|escalat)/i],
    sample: "Explain why decision DEC-2026-0480 was denied",
  },
  {
    intent: "generate_evidence_for_denied",
    label: "Generate evidence pack (denied decisions)",
    permission: "generate_evidence_pack",
    patterns: [
      /\b(generate|create|build|seal)\b.*\bevidence\b.*\bden(y|ied)\b/i,
      /\bevidence\b.*\bden(y|ied)\b/i,
    ],
    sample: "Generate evidence pack for denied decisions",
  },
  {
    intent: "show_audit_events",
    label: "Show audit events",
    permission: null,
    patterns: [/\baudit\b.*\b(event|trail|log)/i, /\baudit\b.*\bfor\b/i],
    sample: "Show audit events for DEC-2026-0480",
  },
  {
    intent: "show_high_risk_decisions",
    label: "Show high-risk decisions",
    permission: null,
    patterns: [/high[\s-]?risk\b.*decision/i, /decision.*high[\s-]?risk/i],
    sample: "Show high-risk decisions",
  },
  {
    intent: "show_pending_approvals",
    label: "Show pending approvals",
    permission: null,
    patterns: [/pending\b.*approval/i, /awaiting\b.*(review|approval)/i],
    sample: "Show pending approvals",
  },
  {
    intent: "show_expiring_vendors",
    label: "Show expiring vendors",
    permission: null,
    patterns: [/vendor.*expir/i, /expir.*(cert|vendor|insurance|contract)/i],
    sample: "Show vendors with expiring certifications",
  },
  {
    intent: "show_high_match_opportunities",
    label: "Show high-match opportunities",
    permission: null,
    patterns: [
      /(procurement|opportunit).*(match|score)/i,
      /high[\s-]?match/i,
    ],
    sample: "Show procurement opportunities with high match scores",
  },
  {
    intent: "recommend_next_module_integration",
    label: "Recommend next module integration",
    permission: null,
    patterns: [/recommend.*module/i, /next\s+module/i],
    sample: "Recommend next module integration",
  },
  {
    intent: "show_modules_needing_integration",
    label: "Show modules needing integration",
    permission: null,
    patterns: [/need(ing)?\s+integrat/i, /require.*integrat/i, /unintegrated/i],
    sample: "Show modules needing integration",
  },
  {
    intent: "show_highest_risk_module",
    label: "Show highest-risk module",
    permission: null,
    patterns: [/(highest|most|riskiest).*module/i, /module.*risk/i, /risk.*module/i],
    sample: "Show highest risk module",
  },
  {
    intent: "show_module_status",
    label: "Show module status",
    permission: null,
    patterns: [/module\s+status/i, /status\s+(of|for)\s+/i],
    sample: "Show module status for ComplianceFlow",
  },
  {
    intent: "show_active_modules",
    label: "Show active modules",
    permission: null,
    patterns: [/active\s+modules/i, /modules?.*active/i, /\bmodules\b/i],
    sample: "Show active modules",
  },
  {
    intent: "prepare_buyer_demo_summary",
    label: "Prepare buyer demo summary",
    permission: null,
    patterns: [/buyer\s+demo/i, /demo\s+summary/i, /prepare.*demo/i],
    sample: "Prepare a buyer demo summary",
  },
  {
    intent: "review_system_risk_posture",
    label: "Review system risk posture",
    permission: null,
    patterns: [/risk\s+posture/i, /review.*risk/i, /system\s+risk/i],
    sample: "Review system risk posture",
  },
  {
    intent: "recommend_next_governance_action",
    label: "Recommend next governance action",
    permission: null,
    patterns: [
      /recommend.*(next|action|governance)/i,
      /next\s+(governance\s+)?action/i,
      /what\s+should\s+i\s+do/i,
    ],
    sample: "Recommend next governance action",
  },
];

export interface ParsedCommand {
  intent: CommandIntent;
  label: string;
  permission: GovernanceAction | null;
  entities: Record<string, string>;
  prompt: string;
}

/** Deterministically parse a prompt into a command. */
export function parseCommand(prompt: string): ParsedCommand {
  const text = prompt.trim();
  const id = text.match(ID_PATTERN)?.[1];
  const entities: Record<string, string> = {};
  if (id) entities.entityId = id.toUpperCase().startsWith("DEC")
    ? id.toUpperCase()
    : id;

  for (const def of INTENT_DEFINITIONS) {
    if (def.patterns.some((re) => re.test(text))) {
      return {
        intent: def.intent,
        label: def.label,
        permission: def.permission,
        entities,
        prompt: text,
      };
    }
  }

  return {
    intent: "unsupported",
    label: "Unsupported command",
    permission: null,
    entities,
    prompt: text,
  };
}

export const SUGGESTED_PROMPTS = INTENT_DEFINITIONS.map((d) => d.sample);
