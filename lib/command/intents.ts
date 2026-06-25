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
