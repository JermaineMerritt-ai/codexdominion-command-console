import { createHash } from "node:crypto";
import type { AuditEntityType, AuditEvent, AuditEventType } from "@/types";

/**
 * Deterministic evidence hash for a mutation payload. Same input → same hash,
 * so it can be unit-tested and independently re-verified.
 */
export function computeEvidenceHash(payload: unknown): string {
  const json = JSON.stringify(payload ?? null);
  return "0x" + createHash("sha256").update(json).digest("hex");
}

export interface AuditInput {
  type: AuditEventType;
  action: string;
  actorId: string;
  organizationId: string;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  prevHash: string;
  at: string;
}

/**
 * Build a tamper-evident audit event. The evidence hash chains the previous
 * hash with the full mutation context so any reordering or edit is detectable.
 */
export function buildAuditEvent(input: AuditInput): AuditEvent {
  const evidenceHash = computeEvidenceHash({
    prevHash: input.prevHash,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    actorId: input.actorId,
    beforeState: input.beforeState ?? null,
    afterState: input.afterState ?? null,
    at: input.at,
  });

  return {
    id: `AUD-${evidenceHash.slice(2, 12)}`,
    type: input.type,
    actorId: input.actorId,
    organizationId: input.organizationId,
    target: input.entityId,
    summary: input.summary,
    hash: evidenceHash,
    prevHash: input.prevHash,
    at: input.at,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    beforeState: input.beforeState ?? null,
    afterState: input.afterState ?? null,
    evidenceHash,
  };
}
