import { prisma } from "@/lib/db/prisma";
import { buildAuditEvent, computeEvidenceHash } from "@/lib/governance/audit";
import { canTransition } from "@/lib/governance/transitions";
import type { Actor, GovernanceMutations } from "./mutations";
import type {
  AuditEntityType,
  AuditEventType,
  Decision,
  EvidencePack,
  Policy,
  Vendor,
  Workflow,
  WorkflowState,
} from "@/types";

const iso = (d: Date) => d.toISOString();
const now = () => new Date();

// Build an audit event row inside a transaction, chained to the latest hash.
async function writeAudit(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  args: {
    type: AuditEventType;
    action: string;
    actor: Actor;
    organizationId: string;
    entityType: AuditEntityType;
    entityId: string;
    summary: string;
    beforeState?: Record<string, unknown> | null;
    afterState?: Record<string, unknown> | null;
    at: Date;
  },
) {
  const prev = await tx.auditEvent.findFirst({
    where: { organizationId: args.organizationId },
    orderBy: { at: "desc" },
  });
  const ev = buildAuditEvent({
    type: args.type,
    action: args.action,
    actorId: args.actor.id,
    organizationId: args.organizationId,
    entityType: args.entityType,
    entityId: args.entityId,
    summary: args.summary,
    beforeState: args.beforeState,
    afterState: args.afterState,
    prevHash: prev?.hash ?? "0x0",
    at: iso(args.at),
  });
  await tx.auditEvent.create({
    data: {
      id: ev.id,
      type: ev.type,
      target: ev.target,
      summary: ev.summary,
      hash: ev.hash,
      prevHash: ev.prevHash,
      at: args.at,
      action: ev.action,
      entityType: ev.entityType,
      entityId: ev.entityId,
      beforeState: (ev.beforeState ?? undefined) as never,
      afterState: (ev.afterState ?? undefined) as never,
      evidenceHash: ev.evidenceHash,
      organizationId: args.organizationId,
      actorId: args.actor.id,
    },
  });
}

async function setDecisionOutcome(
  decisionId: string,
  outcome: "approved" | "denied",
  actor: Actor,
  comment: string | undefined,
): Promise<Decision> {
  return prisma.$transaction(async (tx) => {
    const d = await tx.decision.findUnique({ where: { id: decisionId } });
    if (!d) throw new Error(`Decision ${decisionId} not found`);
    const before = { outcome: d.outcome, reviewerId: d.reviewerId };
    const updated = await tx.decision.update({
      where: { id: decisionId },
      data: { outcome, reviewerId: actor.id },
      include: { workflow: { select: { name: true } } },
    });
    await writeAudit(tx, {
      type: outcome === "approved" ? "decision.approved" : "decision.denied",
      action: outcome === "approved" ? "approve_decision" : "deny_decision",
      actor,
      organizationId: d.organizationId,
      entityType: "decision",
      entityId: d.id,
      summary: `${outcome === "approved" ? "Approved" : "Denied"} ${d.id}${comment ? ` — ${comment}` : ""}`,
      beforeState: before,
      afterState: { outcome, reviewerId: actor.id },
      at: now(),
    });
    return {
      id: updated.id,
      organizationId: updated.organizationId,
      aiSystem: updated.aiSystem,
      workflowId: updated.workflowId,
      workflowName: updated.workflow?.name ?? "",
      policyRule: updated.policyRule,
      outcome: updated.outcome,
      riskLevel: updated.riskLevel,
      reviewerId: updated.reviewerId,
      rationale: updated.rationale,
      evidenceHash: updated.evidenceHash,
      timestamp: iso(updated.timestamp),
    };
  });
}

export const prismaMutations: GovernanceMutations = {
  approveDecision(id, actor, comment) {
    return setDecisionOutcome(id, "approved", actor, comment);
  },
  denyDecision(id, actor, comment) {
    return setDecisionOutcome(id, "denied", actor, comment);
  },

  async transitionWorkflow(workflowId, toState: WorkflowState, actor, note) {
    return prisma.$transaction(async (tx) => {
      const w = await tx.workflow.findUnique({ where: { id: workflowId } });
      if (!w) throw new Error(`Workflow ${workflowId} not found`);
      if (!canTransition(w.state, toState))
        throw new Error(`Invalid transition: ${w.state} → ${toState}`);
      const at = now();
      const updated = await tx.workflow.update({
        where: { id: workflowId },
        data: {
          state: toState,
          updatedAt: at,
          events: { create: { state: toState, actorId: actor.id, note, at } },
        },
        include: { events: { orderBy: { at: "asc" } } },
      });
      await writeAudit(tx, {
        type: "workflow.transitioned",
        action: "transition_workflow",
        actor,
        organizationId: w.organizationId,
        entityType: "workflow",
        entityId: w.id,
        summary: `Workflow ${w.name} → ${toState}`,
        beforeState: { state: w.state },
        afterState: { state: toState },
        at,
      });
      return {
        id: updated.id,
        name: updated.name,
        aiSystem: updated.aiSystem,
        organizationId: updated.organizationId,
        state: updated.state,
        ownerId: updated.ownerId ?? "",
        riskLevel: updated.riskLevel,
        createdAt: iso(updated.createdAt),
        updatedAt: iso(updated.updatedAt),
        timeline: updated.events.map((e) => ({
          state: e.state,
          actorId: e.actorId ?? "",
          at: iso(e.at),
          note: e.note ?? undefined,
        })),
      } satisfies Workflow;
    });
  },

  async publishPolicy(policyId, actor) {
    return setPolicyStatus(policyId, "published", actor);
  },
  async archivePolicy(policyId, actor) {
    return setPolicyStatus(policyId, "archived", actor);
  },

  async completeVendorReview(vendorId, actor) {
    return prisma.$transaction(async (tx) => {
      const v = await tx.vendor.findUnique({ where: { id: vendorId } });
      if (!v) throw new Error(`Vendor ${vendorId} not found`);
      const before = {
        securityReview: v.securityReview,
        status: v.status,
        approvalStatus: v.approvalStatus,
      };
      const updated = await tx.vendor.update({
        where: { id: vendorId },
        data: {
          securityReview: "compliant",
          approvalStatus: "approved",
          status: v.status === "under_review" ? "approved" : v.status,
        },
      });
      await writeAudit(tx, {
        type: "vendor.reviewed",
        action: "complete_vendor_review",
        actor,
        organizationId: v.organizationId,
        entityType: "vendor",
        entityId: v.id,
        summary: `Completed security review for ${v.name}`,
        beforeState: before,
        afterState: {
          securityReview: updated.securityReview,
          status: updated.status,
          approvalStatus: updated.approvalStatus,
        },
        at: now(),
      });
      return {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        status: updated.status,
        riskScore: updated.riskScore,
        securityReview: updated.securityReview,
        insurance: updated.insurance,
        soc2: updated.soc2,
        hipaa: updated.hipaa,
        fedramp: updated.fedramp,
        contractExpiresAt: iso(updated.contractExpiresAt),
        approvalStatus: updated.approvalStatus,
        ownerId: updated.ownerId ?? "",
      } satisfies Vendor;
    });
  },

  async generateEvidencePackRecord(input, actor) {
    return prisma.$transaction(async (tx) => {
      const at = now();
      const hash = computeEvidenceHash({
        title: input.title,
        decisionIds: input.decisionIds,
        at: iso(at),
        actor: actor.id,
      });
      const created = await tx.evidencePack.create({
        data: {
          id: `EVP-${hash.slice(2, 9).toUpperCase()}`,
          title: input.title,
          hash,
          status: "generated",
          formats: input.formats,
          sizeKb: input.decisionIds.length * 620,
          decisionIds: input.decisionIds,
          generatedAt: at,
          organizationId: actor.organizationId,
          responsibleId: actor.id,
        },
      });
      await writeAudit(tx, {
        type: "evidence.generated",
        action: "generate_evidence_pack",
        actor,
        organizationId: actor.organizationId,
        entityType: "evidence_pack",
        entityId: created.id,
        summary: `Sealed evidence pack ${created.id} (${input.decisionIds.length} decisions)`,
        afterState: { hash, decisions: input.decisionIds.length },
        at,
      });
      return {
        id: created.id,
        title: created.title,
        organizationId: created.organizationId,
        decisionIds: created.decisionIds,
        responsibleUserId: created.responsibleId ?? "",
        hash: created.hash,
        generatedAt: iso(created.generatedAt),
        status: created.status,
        format: created.formats as EvidencePack["format"],
        sizeKb: created.sizeKb,
      } satisfies EvidencePack;
    });
  },

  async auditAuthorizationDenied(actor, action, entityType, entityId) {
    await prisma.$transaction(async (tx) => {
      await writeAudit(tx, {
        type: "authorization.denied",
        action,
        actor,
        organizationId: actor.organizationId,
        entityType,
        entityId,
        summary: `Authorization denied: ${actor.role} attempted ${action} on ${entityId}`,
        beforeState: { role: actor.role },
        afterState: { blocked: true },
        at: now(),
      });
    });
  },

  async recordCommandAudit(actor, args) {
    return prisma.$transaction(async (tx) => {
      const prev = await tx.auditEvent.findFirst({
        where: { organizationId: actor.organizationId },
        orderBy: { at: "desc" },
      });
      const at = now();
      const ev = buildAuditEvent({
        type: "command.executed",
        action: "command.executed",
        actorId: actor.id,
        organizationId: actor.organizationId,
        entityType: "command",
        entityId: args.intent,
        summary: `Command: "${args.prompt}" → ${args.summary}`,
        beforeState: null,
        afterState: args.afterState,
        prevHash: prev?.hash ?? "0x0",
        at: iso(at),
      });
      await tx.auditEvent.create({
        data: {
          id: ev.id,
          type: ev.type,
          target: ev.target,
          summary: ev.summary,
          hash: ev.hash,
          prevHash: ev.prevHash,
          at,
          action: ev.action,
          entityType: ev.entityType,
          entityId: ev.entityId,
          afterState: (ev.afterState ?? undefined) as never,
          evidenceHash: ev.evidenceHash,
          organizationId: actor.organizationId,
          actorId: actor.id,
        },
      });
      return ev;
    });
  },

  async recordPlanExecuted(actor, args) {
    return prisma.$transaction(async (tx) => {
      const prev = await tx.auditEvent.findFirst({
        where: { organizationId: actor.organizationId },
        orderBy: { at: "desc" },
      });
      const at = now();
      const ev = buildAuditEvent({
        type: "plan.executed",
        action: "execute_plan",
        actorId: actor.id,
        organizationId: actor.organizationId,
        entityType: "execution_plan",
        entityId: args.planId,
        summary: `Plan executed: ${args.title} (${args.stepCount} steps) — ${args.summary}`,
        beforeState: null,
        afterState: { planId: args.planId, steps: args.stepCount },
        prevHash: prev?.hash ?? "0x0",
        at: iso(at),
      });
      await tx.auditEvent.create({
        data: {
          id: ev.id,
          type: ev.type,
          target: ev.target,
          summary: ev.summary,
          hash: ev.hash,
          prevHash: ev.prevHash,
          at,
          action: ev.action,
          entityType: ev.entityType,
          entityId: ev.entityId,
          afterState: (ev.afterState ?? undefined) as never,
          evidenceHash: ev.evidenceHash,
          organizationId: actor.organizationId,
          actorId: actor.id,
        },
      });
      return ev;
    });
  },
};

async function setPolicyStatus(
  policyId: string,
  status: "published" | "archived",
  actor: Actor,
): Promise<Policy> {
  return prisma.$transaction(async (tx) => {
    const p = await tx.policy.findUnique({ where: { id: policyId } });
    if (!p) throw new Error(`Policy ${policyId} not found`);
    const at = now();
    const updated = await tx.policy.update({
      where: { id: policyId },
      data: { status, lastUpdated: at },
    });
    await writeAudit(tx, {
      type: status === "published" ? "policy.published" : "policy.archived",
      action: status === "published" ? "publish_policy" : "archive_policy",
      actor,
      organizationId: p.organizationId,
      entityType: "policy",
      entityId: p.id,
      summary: `${status === "published" ? "Published" : "Archived"} ${p.name} ${p.version}`,
      beforeState: { status: p.status },
      afterState: { status },
      at,
    });
    return {
      id: updated.id,
      name: updated.name,
      category: updated.category as Policy["category"],
      version: updated.version,
      ownerId: updated.ownerId ?? "",
      status: updated.status,
      description: updated.description,
      rulesCount: updated.rulesCount,
      lastUpdated: iso(updated.lastUpdated),
    };
  });
}
