/**
 * Database seed — populates the same governance demo records used by the
 * typed seed layer (lib/data/seed.ts) so DATABASE mode mirrors DEMO mode.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import {
  ACTIVE_ORG_ID,
  organizations,
  users,
  policies,
  workflows,
  decisions,
  evidencePacks,
  auditEvents,
  vendors,
  opportunities,
  riskAssessments,
} from "../lib/data/seed";

const prisma = new PrismaClient();

const d = (iso: string) => new Date(iso);
// Prisma WorkflowEvent.state has no "created" pseudo-state → map to "draft".
const eventState = (s: string) => (s === "created" ? "draft" : s) as never;

async function main() {
  console.log("Seeding CodexDominion governance records…");

  // Clear in FK-safe order (idempotent reseed).
  await prisma.workflowEvent.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.evidencePack.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.procurementOpportunity.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.organizationSettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  await prisma.organization.createMany({
    data: organizations.map((o) => ({
      id: o.id,
      name: o.name,
      sector: o.sector as never,
      tier: o.tier as never,
      createdAt: d(o.createdAt),
    })),
  });

  await prisma.user.createMany({
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as never,
      title: u.title,
      status: u.status as never,
      avatarColor: u.avatarColor,
      lastActiveAt: d(u.lastActiveAt),
      organizationId: u.organizationId,
    })),
  });

  await prisma.policy.createMany({
    data: policies.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      version: p.version,
      status: p.status as never,
      description: p.description,
      rulesCount: p.rulesCount,
      lastUpdated: d(p.lastUpdated),
      organizationId: ACTIVE_ORG_ID,
      ownerId: p.ownerId,
    })),
  });

  for (const w of workflows) {
    await prisma.workflow.create({
      data: {
        id: w.id,
        name: w.name,
        aiSystem: w.aiSystem,
        state: w.state as never,
        riskLevel: w.riskLevel as never,
        createdAt: d(w.createdAt),
        updatedAt: d(w.updatedAt),
        organizationId: w.organizationId,
        ownerId: w.ownerId,
        events: {
          create: w.timeline.map((e) => ({
            state: eventState(e.state),
            actorId: e.actorId,
            note: e.note ?? null,
            at: d(e.at),
          })),
        },
      },
    });
  }

  await prisma.decision.createMany({
    data: decisions.map((x) => ({
      id: x.id,
      aiSystem: x.aiSystem,
      policyRule: x.policyRule,
      outcome: x.outcome as never,
      riskLevel: x.riskLevel as never,
      rationale: x.rationale,
      evidenceHash: x.evidenceHash,
      timestamp: d(x.timestamp),
      organizationId: x.organizationId,
      workflowId: x.workflowId,
      reviewerId: x.reviewerId,
    })),
  });

  await prisma.evidencePack.createMany({
    data: evidencePacks.map((e) => ({
      id: e.id,
      title: e.title,
      hash: e.hash,
      status: e.status as never,
      formats: e.format,
      sizeKb: e.sizeKb,
      decisionIds: e.decisionIds,
      generatedAt: d(e.generatedAt),
      organizationId: e.organizationId,
      responsibleId: e.responsibleUserId,
    })),
  });

  await prisma.auditEvent.createMany({
    data: auditEvents.map((a) => ({
      id: a.id,
      type: a.type,
      target: a.target,
      summary: a.summary,
      hash: a.hash,
      prevHash: a.prevHash,
      at: d(a.at),
      organizationId: a.organizationId,
      actorId: a.actorId,
    })),
  });

  await prisma.vendor.createMany({
    data: vendors.map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      status: v.status as never,
      riskScore: v.riskScore,
      securityReview: v.securityReview as never,
      insurance: v.insurance as never,
      soc2: v.soc2 as never,
      hipaa: v.hipaa as never,
      fedramp: v.fedramp as never,
      contractExpiresAt: d(v.contractExpiresAt),
      approvalStatus: v.approvalStatus as never,
      organizationId: ACTIVE_ORG_ID,
      ownerId: v.ownerId,
    })),
  });

  await prisma.riskAssessment.createMany({
    data: riskAssessments.map((r) => ({
      id: r.id,
      subjectType: r.subjectType,
      subjectName: r.subjectName,
      score: r.score,
      level: r.level as never,
      factors: r.factors,
      assessedAt: d(r.assessedAt),
      vendorId: r.subjectType === "vendor" ? r.subjectId : null,
    })),
  });

  await prisma.procurementOpportunity.createMany({
    data: opportunities.map((o) => ({
      id: o.id,
      agency: o.agency,
      name: o.name,
      naics: o.naics,
      psc: o.psc,
      status: o.status as never,
      matchScore: o.matchScore,
      estimatedValue: o.estimatedValue,
      requiredControls: o.requiredControls,
      capabilityGaps: o.capabilityGaps,
      proposalDeadline: d(o.proposalDeadline),
      description: o.description,
      organizationId: ACTIVE_ORG_ID,
    })),
  });

  await prisma.organizationSettings.create({
    data: {
      organizationId: ACTIVE_ORG_ID,
      requireDualApproval: true,
      autoGenerateEvidence: true,
      notifyOnViolation: true,
      retentionDays: 2555,
      riskThreshold: 70,
      dataRegion: "us-east",
    },
  });

  console.log(
    `Seeded ${organizations.length} orgs, ${users.length} users, ` +
      `${decisions.length} decisions, ${vendors.length} vendors, ` +
      `${opportunities.length} opportunities.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
