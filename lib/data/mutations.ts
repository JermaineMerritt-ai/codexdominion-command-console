import { APP_MODE } from "@/lib/config";
import { ACTIVE_ORG_ID } from "./seed";
import { demoStore, latestDemoHash } from "./demo-store";
import { buildAuditEvent, computeEvidenceHash } from "@/lib/governance/audit";
import { canTransition } from "@/lib/governance/transitions";
import type {
  AuditEntityType,
  AuditEvent,
  Decision,
  EvidencePack,
  Policy,
  UserRole,
  Vendor,
  Workflow,
  WorkflowState,
} from "@/types";

export interface Actor {
  id: string;
  name: string;
  organizationId: string;
  role: UserRole;
}

export interface GovernanceMutations {
  approveDecision(decisionId: string, actor: Actor, comment?: string): Promise<Decision>;
  denyDecision(decisionId: string, actor: Actor, comment?: string): Promise<Decision>;
  transitionWorkflow(
    workflowId: string,
    toState: WorkflowState,
    actor: Actor,
    note?: string,
  ): Promise<Workflow>;
  publishPolicy(policyId: string, actor: Actor): Promise<Policy>;
  archivePolicy(policyId: string, actor: Actor): Promise<Policy>;
  completeVendorReview(vendorId: string, actor: Actor): Promise<Vendor>;
  generateEvidencePackRecord(
    input: { title: string; decisionIds: string[]; formats: ("JSON" | "PDF" | "ZIP")[] },
    actor: Actor,
  ): Promise<EvidencePack>;
  /** Record a blocked attempt (RBAC denial) in the audit trail. */
  auditAuthorizationDenied(
    actor: Actor,
    action: string,
    entityType: AuditEntityType,
    entityId: string,
  ): Promise<void>;
  /** Record a Command Workspace execution; returns the audit event. */
  recordCommandAudit(
    actor: Actor,
    args: {
      intent: string;
      prompt: string;
      summary: string;
      afterState: Record<string, unknown>;
    },
  ): Promise<AuditEvent>;
  /** Record an AI execution-plan run; returns the audit event. */
  recordPlanExecuted(
    actor: Actor,
    args: {
      planId: string;
      title: string;
      summary: string;
      stepCount: number;
    },
  ): Promise<AuditEvent>;
}

const now = () => new Date().toISOString();

// ── Demo implementation (mutates the in-memory store) ────────

function appendAudit(args: {
  type: Parameters<typeof buildAuditEvent>[0]["type"];
  action: string;
  actor: Actor;
  organizationId: string;
  entityType: Parameters<typeof buildAuditEvent>[0]["entityType"];
  entityId: string;
  summary: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}) {
  const event = buildAuditEvent({
    type: args.type,
    action: args.action,
    actorId: args.actor.id,
    organizationId: args.organizationId,
    entityType: args.entityType,
    entityId: args.entityId,
    summary: args.summary,
    beforeState: args.beforeState,
    afterState: args.afterState,
    prevHash: latestDemoHash(),
    at: now(),
  });
  demoStore.auditEvents.unshift(event);
  return event;
}

export const demoMutations: GovernanceMutations = {
  async approveDecision(decisionId, actor, comment) {
    const d = demoStore.decisions.find((x) => x.id === decisionId);
    if (!d) throw new Error(`Decision ${decisionId} not found`);
    const before = { outcome: d.outcome, reviewerId: d.reviewerId };
    d.outcome = "approved";
    d.reviewerId = actor.id;
    appendAudit({
      type: "decision.approved",
      action: "approve_decision",
      actor,
      organizationId: d.organizationId,
      entityType: "decision",
      entityId: d.id,
      summary: `Approved ${d.id}${comment ? ` — ${comment}` : ""}`,
      beforeState: before,
      afterState: { outcome: d.outcome, reviewerId: d.reviewerId },
    });
    return d;
  },

  async denyDecision(decisionId, actor, comment) {
    const d = demoStore.decisions.find((x) => x.id === decisionId);
    if (!d) throw new Error(`Decision ${decisionId} not found`);
    const before = { outcome: d.outcome, reviewerId: d.reviewerId };
    d.outcome = "denied";
    d.reviewerId = actor.id;
    appendAudit({
      type: "decision.denied",
      action: "deny_decision",
      actor,
      organizationId: d.organizationId,
      entityType: "decision",
      entityId: d.id,
      summary: `Denied ${d.id}${comment ? ` — ${comment}` : ""}`,
      beforeState: before,
      afterState: { outcome: d.outcome, reviewerId: d.reviewerId },
    });
    return d;
  },

  async transitionWorkflow(workflowId, toState, actor, note) {
    const w = demoStore.workflows.find((x) => x.id === workflowId);
    if (!w) throw new Error(`Workflow ${workflowId} not found`);
    if (!canTransition(w.state, toState))
      throw new Error(`Invalid transition: ${w.state} → ${toState}`);
    const before = { state: w.state };
    w.state = toState;
    w.updatedAt = now();
    w.timeline.push({ state: toState, actorId: actor.id, at: w.updatedAt, note });
    appendAudit({
      type: "workflow.transitioned",
      action: "transition_workflow",
      actor,
      organizationId: w.organizationId,
      entityType: "workflow",
      entityId: w.id,
      summary: `Workflow ${w.name} → ${toState}`,
      beforeState: before,
      afterState: { state: toState },
    });
    return w;
  },

  async publishPolicy(policyId, actor) {
    const p = demoStore.policies.find((x) => x.id === policyId);
    if (!p) throw new Error(`Policy ${policyId} not found`);
    const before = { status: p.status };
    p.status = "published";
    p.lastUpdated = now();
    appendAudit({
      type: "policy.published",
      action: "publish_policy",
      actor,
      organizationId: ACTIVE_ORG_ID,
      entityType: "policy",
      entityId: p.id,
      summary: `Published ${p.name} ${p.version}`,
      beforeState: before,
      afterState: { status: p.status },
    });
    return p;
  },

  async archivePolicy(policyId, actor) {
    const p = demoStore.policies.find((x) => x.id === policyId);
    if (!p) throw new Error(`Policy ${policyId} not found`);
    const before = { status: p.status };
    p.status = "archived";
    p.lastUpdated = now();
    appendAudit({
      type: "policy.archived",
      action: "archive_policy",
      actor,
      organizationId: ACTIVE_ORG_ID,
      entityType: "policy",
      entityId: p.id,
      summary: `Archived ${p.name} ${p.version}`,
      beforeState: before,
      afterState: { status: p.status },
    });
    return p;
  },

  async completeVendorReview(vendorId, actor) {
    const v = demoStore.vendors.find((x) => x.id === vendorId);
    if (!v) throw new Error(`Vendor ${vendorId} not found`);
    const before = {
      securityReview: v.securityReview,
      status: v.status,
      approvalStatus: v.approvalStatus,
    };
    v.securityReview = "compliant";
    v.approvalStatus = "approved";
    if (v.status === "under_review") v.status = "approved";
    appendAudit({
      type: "vendor.reviewed",
      action: "complete_vendor_review",
      actor,
      organizationId: ACTIVE_ORG_ID,
      entityType: "vendor",
      entityId: v.id,
      summary: `Completed security review for ${v.name}`,
      beforeState: before,
      afterState: {
        securityReview: v.securityReview,
        status: v.status,
        approvalStatus: v.approvalStatus,
      },
    });
    return v;
  },

  async generateEvidencePackRecord(input, actor) {
    const at = now();
    const hash = computeEvidenceHash({
      title: input.title,
      decisionIds: input.decisionIds,
      at,
      actor: actor.id,
    });
    const pack: EvidencePack = {
      id: `EVP-${hash.slice(2, 9).toUpperCase()}`,
      title: input.title,
      organizationId: actor.organizationId,
      decisionIds: input.decisionIds,
      responsibleUserId: actor.id,
      hash,
      generatedAt: at,
      status: "generated",
      format: input.formats,
      sizeKb: input.decisionIds.length * 620,
    };
    demoStore.evidencePacks.unshift(pack);
    appendAudit({
      type: "evidence.generated",
      action: "generate_evidence_pack",
      actor,
      organizationId: actor.organizationId,
      entityType: "evidence_pack",
      entityId: pack.id,
      summary: `Sealed evidence pack ${pack.id} (${input.decisionIds.length} decisions)`,
      afterState: { hash, decisions: input.decisionIds.length },
    });
    return pack;
  },

  async auditAuthorizationDenied(actor, action, entityType, entityId) {
    appendAudit({
      type: "authorization.denied",
      action,
      actor,
      organizationId: actor.organizationId,
      entityType,
      entityId,
      summary: `Authorization denied: ${actor.role} attempted ${action} on ${entityId}`,
      beforeState: { role: actor.role },
      afterState: { blocked: true },
    });
  },

  async recordCommandAudit(actor, args) {
    return appendAudit({
      type: "command.executed",
      action: "command.executed",
      actor,
      organizationId: actor.organizationId,
      entityType: "command",
      entityId: args.intent,
      summary: `Command: "${args.prompt}" → ${args.summary}`,
      beforeState: null,
      afterState: args.afterState,
    });
  },

  async recordPlanExecuted(actor, args) {
    return appendAudit({
      type: "plan.executed",
      action: "execute_plan",
      actor,
      organizationId: actor.organizationId,
      entityType: "execution_plan",
      entityId: args.planId,
      summary: `Plan executed: ${args.title} (${args.stepCount} steps) — ${args.summary}`,
      beforeState: null,
      afterState: { planId: args.planId, steps: args.stepCount },
    });
  },
};

// ── Selector ─────────────────────────────────────────────────

let cached: GovernanceMutations | null = null;

export async function getMutations(): Promise<GovernanceMutations> {
  if (cached) return cached;
  if (APP_MODE === "database") {
    cached = (await import("./mutations.prisma")).prismaMutations;
  } else {
    cached = demoMutations;
  }
  return cached;
}
