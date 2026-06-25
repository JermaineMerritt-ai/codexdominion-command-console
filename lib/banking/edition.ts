import { getModule } from "@/lib/modules/registry";
import { getDecisions, getVendors } from "@/lib/data/queries";
import type { ModuleView } from "@/lib/modules/contract";
import type { RiskLevel } from "@/types";

export const BANKTRUST_ID = "banktrust-os";

/** Banking regulators / frameworks BankTrust OS produces evidence for. */
export const BANKING_REGULATIONS = [
  "OCC",
  "FDIC",
  "Federal Reserve",
  "FFIEC",
  "CFPB",
  "BSA/AML",
  "Fair Lending (ECOA)",
  "Model Risk (SR 11-7)",
];

export const BANKING_EVIDENCE_TYPES = [
  "OCC Examination",
  "FDIC",
  "Federal Reserve",
  "FFIEC Readiness",
  "CFPB",
  "Fair Lending",
  "BSA/AML",
  "Vendor Management",
  "Model Risk Management",
];

/** Tangible banking prompts (each resolves through the governed pipeline). */
export const BANKING_COMMANDS = [
  "Prepare our OCC examination package",
  "Generate an FFIEC readiness report",
  "Generate Fair Lending evidence",
  "Prepare BSA/AML audit evidence",
  "Show high-risk decisions",
  "Show vendors with expiring certifications",
  "Show highest risk module",
  "Show organization knowledge graph",
];

// Headline figures representing portfolio scale (would come from core banking).
const HEADLINE = {
  loansUnderGovernance: 1248,
  aiDecisionsReviewed: 842,
  aiModelsGoverned: 6,
  vendorRiskScore: 41,
};

export interface BankingKpi {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "destructive" | "success";
  hint?: string;
}

export interface BankingEdition {
  module: ModuleView | undefined;
  kpis: BankingKpi[];
  regulations: string[];
  evidenceTypes: string[];
  commands: string[];
}

export async function getBankingEdition(): Promise<BankingEdition> {
  const [module, decisions, vendors] = await Promise.all([
    getModule(BANKTRUST_ID),
    getDecisions(),
    getVendors(),
  ]);

  const bankRisks = module?.riskItems ?? [];
  const isHigh = (r: RiskLevel) => r === "high" || r === "critical";
  const highRiskLending = (module?.decisions ?? []).filter((d) =>
    isHigh(d.riskLevel),
  ).length;
  const fraudCases = (module?.workflows ?? []).filter((w) =>
    /fraud/i.test(w.name),
  ).length;
  const complaints = bankRisks.filter((r) => /complaint/i.test(r.label)).length;
  const openFindings = bankRisks.filter((r) => /finding|sar/i.test(r.label)).length;

  // Compliance / audit readiness derived from module maturity + open risks.
  const penalty = bankRisks.reduce(
    (a, r) => a + (r.level === "critical" ? 6 : r.level === "high" ? 3 : 1),
    0,
  );
  const compliance = Math.max(60, (module?.integrationMaturity ?? 80) - penalty);
  const auditReadiness = Math.max(60, compliance - 4);

  const kpis: BankingKpi[] = [
    { label: "Loans Under Governance", value: HEADLINE.loansUnderGovernance.toLocaleString() },
    { label: "AI Decisions Reviewed", value: HEADLINE.aiDecisionsReviewed.toLocaleString() },
    { label: "High-Risk Lending Decisions", value: highRiskLending, tone: "warning" },
    { label: "Fraud Cases", value: fraudCases, tone: "warning" },
    { label: "Vendor Risk Score", value: HEADLINE.vendorRiskScore, hint: "lower is better" },
    { label: "Compliance Readiness", value: `${compliance}%`, tone: "success" },
    { label: "Consumer Complaints", value: complaints },
    { label: "Open Regulatory Findings", value: openFindings, tone: openFindings ? "destructive" : "default" },
    { label: "Audit Readiness", value: `${auditReadiness}%` },
    { label: "AI Models Governed", value: HEADLINE.aiModelsGoverned },
  ];

  // (vendors / decisions are reserved for future live-bound banking metrics)
  void vendors;
  void decisions;

  return {
    module,
    kpis,
    regulations: BANKING_REGULATIONS,
    evidenceTypes: BANKING_EVIDENCE_TYPES,
    commands: BANKING_COMMANDS,
  };
}
