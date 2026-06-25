import type { RiskLevel } from "@/types";
import type { ExecutionPlan, ExecutionStep } from "./types";

interface StepTemplate {
  title: string;
  prompt: string; // a command the governed engine understands ("" for report)
  kind: "command" | "report";
  moduleHint?: string;
}

interface PlanTemplate {
  intent: string;
  title: string;
  patterns: RegExp[];
  sample: string;
  riskLevel: RiskLevel;
  modules: string[];
  steps: StepTemplate[];
}

const REPORT: StepTemplate = {
  title: "Produce executive report",
  prompt: "",
  kind: "report",
};

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    intent: "prepare_fedramp_readiness",
    title: "FedRAMP Readiness Assessment",
    patterns: [/fedramp/i],
    sample: "Prepare for a FedRAMP assessment",
    riskLevel: "medium",
    modules: ["ComplianceFlow", "codex-control-plane", "Vendors", "Evidence"],
    steps: [
      { title: "Review system risk posture", prompt: "Review system risk posture", kind: "command" },
      { title: "Review vendor certifications", prompt: "Show vendors with expiring certifications", kind: "command", moduleHint: "Vendors" },
      { title: "Review high-risk AI decisions", prompt: "Show high-risk decisions", kind: "command" },
      { title: "Check ComplianceFlow", prompt: "Show ComplianceFlow health", kind: "command", moduleHint: "ComplianceFlow" },
      { title: "Gather denied-decision evidence", prompt: "Generate evidence pack for denied decisions", kind: "command", moduleHint: "Evidence" },
      REPORT,
    ],
  },
  {
    intent: "prepare_hipaa_audit",
    title: "HIPAA Audit Preparation",
    patterns: [/hipaa/i],
    sample: "Prepare for a HIPAA audit",
    riskLevel: "high",
    modules: ["ComplianceFlow", "codex-control-plane", "Vendors", "Evidence"],
    steps: [
      { title: "Review system risk posture", prompt: "Review system risk posture", kind: "command" },
      { title: "Check ComplianceFlow", prompt: "Show ComplianceFlow health", kind: "command", moduleHint: "ComplianceFlow" },
      { title: "Review vendor certifications (HIPAA)", prompt: "Show vendors with expiring certifications", kind: "command", moduleHint: "Vendors" },
      { title: "Review control-plane audit trail", prompt: "Show control plane audit events", kind: "command", moduleHint: "codex-control-plane" },
      { title: "Gather denied-decision evidence", prompt: "Generate evidence pack for denied decisions", kind: "command", moduleHint: "Evidence" },
      REPORT,
    ],
  },
  {
    intent: "review_contractor_payment_risks",
    title: "Contractor & Payment Risk Review",
    patterns: [/contractor\s+payment/i, /payment\s+risk\s+review/i, /review.*contractor/i],
    sample: "Review contractor payment risks",
    riskLevel: "high",
    modules: ["GCFI"],
    steps: [
      { title: "Payment approval risks", prompt: "Show payment approval risks", kind: "command", moduleHint: "GCFI" },
      { title: "Contractor milestone risks", prompt: "Show contractor milestone risks", kind: "command", moduleHint: "GCFI" },
      { title: "GCFI health", prompt: "Show GCFI health", kind: "command", moduleHint: "GCFI" },
      REPORT,
    ],
  },
  {
    intent: "review_procurement_posture",
    title: "Procurement Posture Review",
    patterns: [/procurement\s+posture/i, /review\s+procurement/i],
    sample: "Review procurement posture",
    riskLevel: "medium",
    modules: ["Procurement"],
    steps: [
      { title: "High-match opportunities", prompt: "Show procurement opportunities with high match scores", kind: "command", moduleHint: "Procurement" },
      { title: "Modules needing integration", prompt: "Show modules needing integration", kind: "command" },
      REPORT,
    ],
  },
  {
    intent: "review_ai_governance_posture",
    title: "AI Governance Posture Review",
    patterns: [/governance\s+posture/i, /ai\s+governance\s+posture/i],
    sample: "Review AI governance posture",
    riskLevel: "medium",
    modules: ["Decisions", "Workflows"],
    steps: [
      { title: "System risk posture", prompt: "Review system risk posture", kind: "command" },
      { title: "High-risk decisions", prompt: "Show high-risk decisions", kind: "command" },
      { title: "Pending approvals", prompt: "Show pending approvals", kind: "command" },
      { title: "Recommended next action", prompt: "Recommend next governance action", kind: "command" },
      REPORT,
    ],
  },
  {
    intent: "prepare_executive_briefing",
    title: "Executive Briefing",
    patterns: [/executive\s+brief/i],
    sample: "Prepare an executive briefing",
    riskLevel: "low",
    modules: ["Dashboard", "Modules"],
    steps: [
      { title: "Governance snapshot", prompt: "Prepare a buyer demo summary", kind: "command" },
      { title: "System risk posture", prompt: "Review system risk posture", kind: "command" },
      { title: "Active modules", prompt: "Show active modules", kind: "command" },
      REPORT,
    ],
  },
  {
    intent: "prepare_pilot_readiness",
    title: "Pilot Readiness Report",
    patterns: [/pilot\s+readiness/i, /prepare.*pilot/i, /ready.*pilot/i],
    sample: "Prepare a pilot readiness report",
    riskLevel: "medium",
    modules: ["codex-control-plane", "ComplianceFlow", "GCFI", "Evidence"],
    steps: [
      { title: "System risk posture", prompt: "Review system risk posture", kind: "command" },
      { title: "Control plane health", prompt: "Show control plane health", kind: "command", moduleHint: "codex-control-plane" },
      { title: "ComplianceFlow health", prompt: "Show ComplianceFlow health", kind: "command", moduleHint: "ComplianceFlow" },
      { title: "GCFI health", prompt: "Show GCFI health", kind: "command", moduleHint: "GCFI" },
      { title: "Gather evidence", prompt: "Generate evidence pack for denied decisions", kind: "command", moduleHint: "Evidence" },
      REPORT,
    ],
  },
];

// Cheap deterministic hash — client-safe (no node:crypto).
function slugHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(6, "0").slice(0, 6).toUpperCase();
}

export function matchPlanTemplate(prompt: string): PlanTemplate | null {
  const text = prompt.trim();
  for (const t of PLAN_TEMPLATES) {
    if (t.patterns.some((re) => re.test(text))) return t;
  }
  return null;
}

/** Build a proposed (not executed) ExecutionPlan, or null if no template matches. */
export function buildExecutionPlan(prompt: string): ExecutionPlan | null {
  const t = matchPlanTemplate(prompt);
  if (!t) return null;
  const steps: ExecutionStep[] = t.steps.map((s, i) => ({
    key: `${t.intent}-${i}`,
    title: s.title,
    prompt: s.prompt,
    kind: s.kind,
    moduleHint: s.moduleHint,
    status: "pending",
    include: true,
  }));
  return {
    id: `PLAN-${slugHash(prompt + t.intent)}`,
    intent: t.intent,
    title: t.title,
    prompt: prompt.trim(),
    steps,
    estimateMinutes: Math.max(2, steps.length * 2),
    riskLevel: t.riskLevel,
    modules: t.modules,
    status: "proposed",
  };
}

export const PLAN_SUGGESTIONS = PLAN_TEMPLATES.map((t) => t.sample);
