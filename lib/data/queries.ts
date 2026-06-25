import { ACTIVE_ORG_ID } from "./seed";
import { getRepository } from "./repository";
import type {
  Decision,
  EvidencePack,
  Organization,
  User,
  Vendor,
  Workflow,
} from "@/types";

// All accessors are async and delegate to the active repository
// (seed in demo mode, Prisma in database mode). Pages import only from
// this module — never from seed.ts or repository.prisma.ts directly.

// ── Entity lookups ───────────────────────────────────────────

export async function getOrganizations() {
  return (await getRepository()).organizations();
}

export async function getActiveOrganization(): Promise<Organization> {
  const orgs = await getOrganizations();
  return orgs.find((o) => o.id === ACTIVE_ORG_ID) ?? orgs[0];
}

export async function getUsers() {
  return (await getRepository()).users();
}

export async function getUser(id: string | null): Promise<User | undefined> {
  if (!id) return undefined;
  return (await getUsers()).find((u) => u.id === id);
}

/** Map of userId → User for synchronous name resolution inside render. */
export async function getUsersById(): Promise<Record<string, User>> {
  const users = await getUsers();
  return Object.fromEntries(users.map((u) => [u.id, u]));
}

/** Resolve a display name from a user map (sync helper for JSX). */
export function nameOf(
  users: Record<string, User>,
  id: string | null,
): string {
  if (!id) return "Unassigned";
  return users[id]?.name ?? "Unassigned";
}

export async function getPolicies() {
  return (await getRepository()).policies();
}

export async function getPolicy(id: string) {
  return (await getPolicies()).find((p) => p.id === id);
}

export async function getWorkflows(): Promise<Workflow[]> {
  const rows = await (await getRepository()).workflows();
  return [...rows].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
}

export async function getWorkflow(id: string) {
  return (await getWorkflows()).find((w) => w.id === id);
}

export async function getDecisions(): Promise<Decision[]> {
  const rows = await (await getRepository()).decisions();
  return [...rows].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
  );
}

export async function getDecision(id: string) {
  return (await getDecisions()).find((d) => d.id === id);
}

export async function getEvidencePacks(): Promise<EvidencePack[]> {
  const rows = await (await getRepository()).evidencePacks();
  return [...rows].sort(
    (a, b) => +new Date(b.generatedAt) - +new Date(a.generatedAt),
  );
}

export async function getEvidencePack(id: string) {
  return (await getEvidencePacks()).find((e) => e.id === id);
}

export async function getVendors(): Promise<Vendor[]> {
  const rows = await (await getRepository()).vendors();
  return [...rows].sort((a, b) => b.riskScore - a.riskScore);
}

export async function getOpportunities() {
  const rows = await (await getRepository()).opportunities();
  return [...rows].sort((a, b) => b.matchScore - a.matchScore);
}

export async function getOpportunity(id: string) {
  return (await getOpportunities()).find((o) => o.id === id);
}

export async function getAuditEvents() {
  const rows = await (await getRepository()).auditEvents();
  return [...rows].sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export async function getNotifications() {
  const rows = await (await getRepository()).notifications();
  return [...rows].sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export async function getRiskAssessments() {
  const rows = await (await getRepository()).riskAssessments();
  return [...rows].sort((a, b) => b.score - a.score);
}

export async function getDashboardSeries() {
  return (await getRepository()).dashboardSeries();
}

// ── Dashboard metrics ────────────────────────────────────────

export async function getDashboardMetrics() {
  const [decisions, workflows, evidencePacks, vendors] = await Promise.all([
    getDecisions(),
    getWorkflows(),
    getEvidencePacks(),
    getVendors(),
  ]);

  // "Today" = the most recent decision date so demo data always shows activity.
  const latest = decisions[0]?.timestamp?.slice(0, 10) ?? "";
  const decisionsToday = decisions.filter((d) =>
    d.timestamp.startsWith(latest),
  ).length;

  return {
    activeWorkflows: workflows.filter(
      (w) => w.state !== "closed" && w.state !== "denied",
    ).length,
    pendingApprovals: workflows.filter(
      (w) => w.state === "pending_review" || w.state === "escalated",
    ).length,
    decisionsToday,
    policyViolations: decisions.filter(
      (d) => d.outcome === "flagged" || d.outcome === "denied",
    ).length,
    evidenceGenerated: evidencePacks.filter((e) => e.status === "generated")
      .length,
    highRiskVendors: vendors.filter((v) => v.riskScore >= 60).length,
  };
}

/** Composite audit-readiness score (0-100) derived from current state. */
export async function getAuditReadinessScore(): Promise<number> {
  const [policies, decisions, evidencePacks, vendors] = await Promise.all([
    getPolicies(),
    getDecisions(),
    getEvidencePacks(),
    getVendors(),
  ]);
  if (!decisions.length || !evidencePacks.length || !vendors.length) return 0;

  const publishedPolicies = policies.filter(
    (p) => p.status === "published",
  ).length;
  const policyScore = Math.min(publishedPolicies / 6, 1) * 30;
  const reviewScore =
    (decisions.filter((d) => d.reviewerId).length / decisions.length) * 30;
  const evidenceScore =
    (evidencePacks.filter((e) => e.status !== "generating").length /
      evidencePacks.length) *
    20;
  const vendorScore =
    (vendors.filter((v) => v.status === "approved").length / vendors.length) *
    20;

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

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const [policies, vendors, evidencePacks, users, workflows, decisions] =
    await Promise.all([
      getPolicies(),
      getVendors(),
      getEvidencePacks(),
      getUsers(),
      getWorkflows(),
      getDecisions(),
    ]);

  const results: SearchResult[] = [];
  for (const p of policies)
    if (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      results.push({
        id: p.id,
        type: "Policy",
        title: p.name,
        subtitle: `${p.category} · ${p.version}`,
        href: "/policies",
      });
  for (const v of vendors)
    if (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
      results.push({
        id: v.id,
        type: "Vendor",
        title: v.name,
        subtitle: v.category,
        href: "/vendors",
      });
  for (const e of evidencePacks)
    if (e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      results.push({
        id: e.id,
        type: "Evidence",
        title: e.title,
        subtitle: e.id,
        href: "/evidence",
      });
  for (const u of users)
    if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      results.push({
        id: u.id,
        type: "User",
        title: u.name,
        subtitle: u.title,
        href: "/users",
      });
  for (const w of workflows)
    if (w.name.toLowerCase().includes(q) || w.aiSystem.toLowerCase().includes(q))
      results.push({
        id: w.id,
        type: "Workflow",
        title: w.name,
        subtitle: w.aiSystem,
        href: "/workflows",
      });
  for (const d of decisions)
    if (d.id.toLowerCase().includes(q) || d.policyRule.toLowerCase().includes(q))
      results.push({
        id: d.id,
        type: "Decision",
        title: d.id,
        subtitle: d.policyRule,
        href: "/decisions",
      });

  return results.slice(0, 12);
}
