import {
  ACTIVE_ORG_ID,
  auditEvents,
  decisions,
  evidencePacks,
  notifications,
  opportunities,
  organizations,
  policies,
  riskAssessments,
  users,
  vendors,
  workflows,
} from "./seed";
import type {
  Decision,
  EvidencePack,
  User,
  Vendor,
  Workflow,
} from "@/types";

// ── Entity lookups ───────────────────────────────────────────

export function getActiveOrganization() {
  return organizations.find((o) => o.id === ACTIVE_ORG_ID)!;
}

export function getUser(id: string | null): User | undefined {
  if (!id) return undefined;
  return users.find((u) => u.id === id);
}

export function getUserName(id: string | null): string {
  return getUser(id)?.name ?? "Unassigned";
}

export function getUsers() {
  return users;
}

export function getPolicies() {
  return policies;
}

export function getPolicy(id: string) {
  return policies.find((p) => p.id === id);
}

export function getWorkflows(): Workflow[] {
  return [...workflows].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
}

export function getWorkflow(id: string) {
  return workflows.find((w) => w.id === id);
}

export function getDecisions(): Decision[] {
  return [...decisions].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
  );
}

export function getDecision(id: string) {
  return decisions.find((d) => d.id === id);
}

export function getEvidencePacks(): EvidencePack[] {
  return [...evidencePacks].sort(
    (a, b) => +new Date(b.generatedAt) - +new Date(a.generatedAt),
  );
}

export function getEvidencePack(id: string) {
  return evidencePacks.find((e) => e.id === id);
}

export function getVendors(): Vendor[] {
  return [...vendors].sort((a, b) => b.riskScore - a.riskScore);
}

export function getOpportunities() {
  return [...opportunities].sort((a, b) => b.matchScore - a.matchScore);
}

export function getOpportunity(id: string) {
  return opportunities.find((o) => o.id === id);
}

export function getAuditEvents() {
  return [...auditEvents].sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export function getNotifications() {
  return [...notifications].sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export function getRiskAssessments() {
  return [...riskAssessments].sort((a, b) => b.score - a.score);
}

// ── Dashboard metrics ────────────────────────────────────────

export function getDashboardMetrics() {
  const today = "2026-06-24";
  const decisionsToday = decisions.filter((d) =>
    d.timestamp.startsWith(today),
  ).length;
  const pendingApprovals = workflows.filter(
    (w) => w.state === "pending_review" || w.state === "escalated",
  ).length;
  const activeWorkflows = workflows.filter(
    (w) => w.state !== "closed" && w.state !== "denied",
  ).length;
  const policyViolations = decisions.filter(
    (d) => d.outcome === "flagged" || d.outcome === "denied",
  ).length;
  const evidenceGenerated = evidencePacks.filter(
    (e) => e.status === "generated",
  ).length;
  const highRiskVendors = vendors.filter((v) => v.riskScore >= 60).length;

  return {
    activeWorkflows,
    pendingApprovals,
    decisionsToday,
    policyViolations,
    evidenceGenerated,
    highRiskVendors,
  };
}

/** Composite audit-readiness score (0-100) derived from current state. */
export function getAuditReadinessScore(): number {
  const publishedPolicies = policies.filter(
    (p) => p.status === "published",
  ).length;
  const policyScore = Math.min(publishedPolicies / 6, 1) * 30;

  const reviewed = decisions.filter((d) => d.reviewerId).length;
  const reviewScore = (reviewed / decisions.length) * 30;

  const generated = evidencePacks.filter(
    (e) => e.status !== "generating",
  ).length;
  const evidenceScore = (generated / evidencePacks.length) * 20;

  const compliantVendors = vendors.filter(
    (v) => v.status === "approved",
  ).length;
  const vendorScore = (compliantVendors / vendors.length) * 20;

  return Math.round(policyScore + reviewScore + evidenceScore + vendorScore);
}

export function getComplianceStatus() {
  return [
    { label: "Model Risk (SR 11-7)", state: "compliant" as const, pct: 96 },
    { label: "Fair Lending", state: "attention" as const, pct: 82 },
    { label: "Data Governance", state: "compliant" as const, pct: 94 },
    { label: "Privacy (GLBA/CCPA)", state: "compliant" as const, pct: 91 },
    { label: "Security Baseline", state: "compliant" as const, pct: 98 },
  ];
}

// ── Global search ────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
}

export function globalSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const p of policies) {
    if (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      results.push({
        id: p.id,
        type: "Policy",
        title: p.name,
        subtitle: `${p.category} · ${p.version}`,
        href: "/policies",
      });
  }
  for (const v of vendors) {
    if (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
      results.push({
        id: v.id,
        type: "Vendor",
        title: v.name,
        subtitle: v.category,
        href: "/vendors",
      });
  }
  for (const e of evidencePacks) {
    if (e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      results.push({
        id: e.id,
        type: "Evidence",
        title: e.title,
        subtitle: e.id,
        href: "/evidence",
      });
  }
  for (const u of users) {
    if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      results.push({
        id: u.id,
        type: "User",
        title: u.name,
        subtitle: u.title,
        href: "/users",
      });
  }
  for (const w of workflows) {
    if (w.name.toLowerCase().includes(q) || w.aiSystem.toLowerCase().includes(q))
      results.push({
        id: w.id,
        type: "Workflow",
        title: w.name,
        subtitle: w.aiSystem,
        href: "/workflows",
      });
  }
  for (const d of decisions) {
    if (d.id.toLowerCase().includes(q) || d.policyRule.toLowerCase().includes(q))
      results.push({
        id: d.id,
        type: "Decision",
        title: d.id,
        subtitle: d.policyRule,
        href: "/decisions",
      });
  }

  return results.slice(0, 12);
}
