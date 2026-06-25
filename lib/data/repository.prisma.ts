import { prisma } from "@/lib/db/prisma";
import {
  decisionsOverTime as seedDecisionsOverTime,
  approvalTrends as seedApprovalTrends,
} from "./seed";
import type { DataRepository, DashboardSeries } from "./repository";
import type {
  AuditEvent,
  Decision,
  EvidencePack,
  Notification,
  Organization,
  Policy,
  ProcurementOpportunity,
  RiskAssessment,
  RiskLevel,
  SeriesPoint,
  User,
  Vendor,
  Workflow,
} from "@/types";

const iso = (d: Date) => d.toISOString();

/**
 * Prisma / Supabase implementation of the data contract. Rows are mapped to
 * the shared domain types so pages are identical across demo and database
 * modes. Analytics that don't yet have a dedicated subsystem (time-series
 * charts) reuse representative shapes; risk distribution and notifications are
 * derived from live data.
 */
export const prismaRepository: DataRepository = {
  async organizations() {
    const rows = await prisma.organization.findMany();
    return rows.map<Organization>((o) => ({
      id: o.id,
      name: o.name,
      sector: o.sector,
      tier: o.tier,
      createdAt: iso(o.createdAt),
    }));
  },

  async users() {
    const rows = await prisma.user.findMany();
    return rows.map<User>((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      title: u.title ?? "",
      organizationId: u.organizationId,
      status: u.status,
      lastActiveAt: iso(u.lastActiveAt),
      avatarColor: u.avatarColor,
    }));
  },

  async policies() {
    const rows = await prisma.policy.findMany();
    return rows.map<Policy>((p) => ({
      id: p.id,
      name: p.name,
      category: p.category as Policy["category"],
      version: p.version,
      ownerId: p.ownerId ?? "",
      status: p.status,
      description: p.description,
      rulesCount: p.rulesCount,
      lastUpdated: iso(p.lastUpdated),
    }));
  },

  async workflows() {
    const rows = await prisma.workflow.findMany({
      include: { events: { orderBy: { at: "asc" } } },
    });
    return rows.map<Workflow>((w) => ({
      id: w.id,
      name: w.name,
      aiSystem: w.aiSystem,
      organizationId: w.organizationId,
      state: w.state,
      ownerId: w.ownerId ?? "",
      riskLevel: w.riskLevel,
      createdAt: iso(w.createdAt),
      updatedAt: iso(w.updatedAt),
      timeline: w.events.map((e) => ({
        state: e.state,
        actorId: e.actorId ?? "",
        at: iso(e.at),
        note: e.note ?? undefined,
      })),
    }));
  },

  async decisions() {
    const rows = await prisma.decision.findMany({
      include: { workflow: { select: { name: true } } },
    });
    return rows.map<Decision>((d) => ({
      id: d.id,
      organizationId: d.organizationId,
      aiSystem: d.aiSystem,
      workflowId: d.workflowId,
      workflowName: d.workflow?.name ?? "",
      policyRule: d.policyRule,
      outcome: d.outcome,
      riskLevel: d.riskLevel,
      reviewerId: d.reviewerId,
      rationale: d.rationale,
      evidenceHash: d.evidenceHash,
      timestamp: iso(d.timestamp),
    }));
  },

  async evidencePacks() {
    const rows = await prisma.evidencePack.findMany();
    return rows.map<EvidencePack>((e) => ({
      id: e.id,
      title: e.title,
      organizationId: e.organizationId,
      decisionIds: e.decisionIds,
      responsibleUserId: e.responsibleId ?? "",
      hash: e.hash,
      generatedAt: iso(e.generatedAt),
      status: e.status,
      format: e.formats as EvidencePack["format"],
      sizeKb: e.sizeKb,
    }));
  },

  async vendors() {
    const rows = await prisma.vendor.findMany();
    return rows.map<Vendor>((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      status: v.status,
      riskScore: v.riskScore,
      securityReview: v.securityReview,
      insurance: v.insurance,
      soc2: v.soc2,
      hipaa: v.hipaa,
      fedramp: v.fedramp,
      contractExpiresAt: iso(v.contractExpiresAt),
      approvalStatus: v.approvalStatus,
      ownerId: v.ownerId ?? "",
    }));
  },

  async opportunities() {
    const rows = await prisma.procurementOpportunity.findMany();
    return rows.map<ProcurementOpportunity>((o) => ({
      id: o.id,
      agency: o.agency,
      name: o.name,
      naics: o.naics,
      psc: o.psc,
      status: o.status,
      matchScore: o.matchScore,
      estimatedValue: Number(o.estimatedValue),
      requiredControls: o.requiredControls,
      capabilityGaps: o.capabilityGaps,
      proposalDeadline: iso(o.proposalDeadline),
      description: o.description,
    }));
  },

  async auditEvents() {
    const rows = await prisma.auditEvent.findMany();
    return rows.map<AuditEvent>((a) => ({
      id: a.id,
      type: a.type as AuditEvent["type"],
      actorId: a.actorId ?? "",
      organizationId: a.organizationId,
      target: a.target,
      summary: a.summary,
      hash: a.hash,
      prevHash: a.prevHash,
      at: iso(a.at),
    }));
  },

  async riskAssessments() {
    const rows = await prisma.riskAssessment.findMany();
    return rows.map<RiskAssessment>((r) => ({
      id: r.id,
      subjectType: r.subjectType as RiskAssessment["subjectType"],
      subjectId: r.vendorId ?? r.subjectName,
      subjectName: r.subjectName,
      score: r.score,
      level: r.level,
      factors: (r.factors as RiskAssessment["factors"]) ?? [],
      assessedAt: iso(r.assessedAt),
    }));
  },

  async notifications(): Promise<Notification[]> {
    // Derived from live governance state until a dedicated notifications
    // subsystem ships (see docs/roadmap.md, Phase 3).
    const [decisions, vendors, workflows] = await Promise.all([
      this.decisions(),
      this.vendors(),
      this.workflows(),
    ]);
    const out: Notification[] = [];
    for (const d of decisions.filter(
      (x) => x.outcome === "flagged" || x.outcome === "denied",
    ).slice(0, 3)) {
      out.push({
        id: `ntf_${d.id}`,
        type: "policy_violation",
        title: `Policy issue on ${d.id}`,
        body: `${d.aiSystem} — ${d.policyRule}`,
        read: false,
        at: d.timestamp,
        href: "/decisions",
      });
    }
    for (const w of workflows.filter(
      (x) => x.state === "pending_review" || x.state === "escalated",
    ).slice(0, 2)) {
      out.push({
        id: `ntf_${w.id}`,
        type: "pending_approval",
        title: `Workflow awaiting review`,
        body: w.name,
        read: false,
        at: w.updatedAt,
        href: "/workflows",
      });
    }
    for (const v of vendors.filter((x) => x.status === "expiring").slice(0, 2)) {
      out.push({
        id: `ntf_${v.id}`,
        type: "vendor_expiration",
        title: `Vendor expiring soon`,
        body: `${v.name} — contract/insurance lapsing`,
        read: true,
        at: v.contractExpiresAt,
        href: "/vendors",
      });
    }
    return out;
  },

  async dashboardSeries(): Promise<DashboardSeries> {
    const decisions = await this.decisions();
    const counts: Record<RiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    for (const d of decisions) counts[d.riskLevel] += 1;
    const riskDistribution: SeriesPoint[] = [
      { label: "Low", value: counts.low },
      { label: "Medium", value: counts.medium },
      { label: "High", value: counts.high },
      { label: "Critical", value: counts.critical },
    ];

    const violationsByCat = new Map<string, number>();
    for (const d of decisions) {
      if (d.outcome === "flagged" || d.outcome === "denied") {
        const cat = d.policyRule.split(":")[0] || "Other";
        violationsByCat.set(cat, (violationsByCat.get(cat) ?? 0) + 1);
      }
    }
    const policyViolations: SeriesPoint[] = [...violationsByCat.entries()].map(
      ([label, value]) => ({ label, value }),
    );

    return {
      decisionsOverTime: seedDecisionsOverTime,
      policyViolations: policyViolations.length
        ? policyViolations
        : [{ label: "None", value: 0 }],
      approvalTrends: seedApprovalTrends,
      riskDistribution,
    };
  },
};
