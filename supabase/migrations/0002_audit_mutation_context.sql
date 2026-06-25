-- ─────────────────────────────────────────────────────────────
-- Sprint 02 — structured mutation context on audit events.
-- Adds the fields populated by live governance actions
-- (approve/deny, transition, publish/archive, vendor review,
-- evidence pack records).
-- ─────────────────────────────────────────────────────────────

alter table audit_events
  add column if not exists action        text,
  add column if not exists entity_type   text,
  add column if not exists entity_id     text,
  add column if not exists before_state  jsonb,
  add column if not exists after_state   jsonb,
  add column if not exists evidence_hash text;
