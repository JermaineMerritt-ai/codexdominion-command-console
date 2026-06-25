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

export interface ChainVerification {
  intact: boolean;
  total: number;
  roots: number;
  danglingRefs: number;
  duplicateHashes: number;
}

/**
 * Verify the integrity of a hash-chained audit log. Order-independent: every
 * non-root event's `prevHash` must reference an existing event hash, and hashes
 * must be unique. Exactly one "root" (prevHash outside the set) is expected.
 */
export function verifyAuditChain(
  events: { hash: string; prevHash: string }[],
): ChainVerification {
  const hashes = new Set(events.map((e) => e.hash));
  const seen = new Set<string>();
  let duplicateHashes = 0;
  for (const e of events) {
    if (seen.has(e.hash)) duplicateHashes++;
    seen.add(e.hash);
  }
  const rootEvents = events.filter((e) => !hashes.has(e.prevHash));
  const roots = rootEvents.length;
  // Dangling = more than the single expected genesis root.
  const danglingRefs = Math.max(0, roots - 1);
  return {
    intact: danglingRefs === 0 && duplicateHashes === 0,
    total: events.length,
    roots,
    danglingRefs,
    duplicateHashes,
  };
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
