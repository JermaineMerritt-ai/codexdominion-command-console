import type { GovernanceAction } from "@/lib/governance/rbac";
import { detectLanguage } from "@/lib/i18n/detect";
import { INTENT_SYNONYMS } from "@/lib/i18n/intent-synonyms";
import type { Locale } from "@/lib/i18n/locales";

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
  | "sync_gcfi"
  | "show_gcfi_health"
  | "show_gcfi_decisions"
  | "show_gcfi_audit_events"
  | "show_contractor_milestone_risks"
  | "show_payment_approval_risks"
  | "show_organization_knowledge"
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
    intent: "show_contractor_milestone_risks",
    label: "Show contractor milestone risks",
    permission: "view_gcfi",
    patterns: [/milestone\s+risk/i, /contractor\s+milestone/i, /milestone.*risk/i],
    sample: "Show contractor milestone risks",
  },
  {
    intent: "show_payment_approval_risks",
    label: "Show payment approval risks",
    permission: "view_gcfi",
    patterns: [/payment.*(risk|approval|authoriz)/i, /payment\s+approval/i],
    sample: "Show payment approval risks",
  },
  {
    intent: "sync_gcfi",
    label: "Sync GCFI",
    permission: "sync_gcfi",
    patterns: [/sync.*gcfi/i, /gcfi.*sync/i, /sync.*government contractor/i],
    sample: "Sync GCFI",
  },
  {
    intent: "show_gcfi_health",
    label: "Show GCFI health",
    permission: "view_gcfi",
    patterns: [/gcfi.*health/i, /health.*gcfi/i, /government contractor.*health/i],
    sample: "Show GCFI health",
  },
  {
    intent: "show_gcfi_decisions",
    label: "Show GCFI decisions",
    permission: "view_gcfi",
    patterns: [/gcfi.*decision/i, /government contractor.*decision/i],
    sample: "Show GCFI decisions",
  },
  {
    intent: "show_gcfi_audit_events",
    label: "Show GCFI audit events",
    permission: "view_gcfi",
    patterns: [/gcfi.*audit/i, /government contractor.*audit/i],
    sample: "Show GCFI audit events",
  },
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
    intent: "show_organization_knowledge",
    label: "Show organization knowledge",
    permission: null,
    patterns: [/knowledge graph/i, /organization knowledge/i, /what.*\bknow\b/i],
    sample: "Show organization knowledge graph",
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
  /** Detected input language (governance is identical regardless). */
  language: Locale;
}

const DEFINITION_BY_INTENT = new Map(
  INTENT_DEFINITIONS.map((d) => [d.intent, d]),
);

/**
 * Deterministically parse a prompt into a canonical command. English patterns
 * match first; non-English prompts are resolved via multilingual synonyms to the
 * SAME canonical intent. Language changes; governance does not.
 */
export function parseCommand(prompt: string): ParsedCommand {
  const text = prompt.trim();
  const language = detectLanguage(text);
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
        language,
      };
    }
  }

  // Multilingual synonyms → same canonical intent.
  for (const [intent, patterns] of Object.entries(INTENT_SYNONYMS)) {
    if (patterns?.some((re) => re.test(text))) {
      const def = DEFINITION_BY_INTENT.get(intent as CommandIntent);
      if (def)
        return {
          intent: def.intent,
          label: def.label,
          permission: def.permission,
          entities,
          prompt: text,
          language,
        };
    }
  }

  return {
    intent: "unsupported",
    label: "Unsupported command",
    permission: null,
    entities,
    prompt: text,
    language,
  };
}

export const SUGGESTED_PROMPTS = INTENT_DEFINITIONS.map((d) => d.sample);
