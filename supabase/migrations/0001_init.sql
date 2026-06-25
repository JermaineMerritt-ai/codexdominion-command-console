-- ─────────────────────────────────────────────────────────────
-- CodexDominion Command Console — initial schema (Supabase / Postgres)
-- Mirrors prisma/schema.prisma. Prisma is the source of truth for
-- application access; this migration provisions tables + row-level
-- security for multi-tenant isolation by organization.
-- ─────────────────────────────────────────────────────────────

-- Enums ------------------------------------------------------------------
create type sector as enum ('enterprise','healthcare','finance','government');
create type org_tier as enum ('pilot','standard','enterprise');
create type user_role as enum ('administrator','compliance_officer','reviewer','auditor','executive','viewer');
create type user_status as enum ('active','invited','suspended');
create type risk_level as enum ('low','medium','high','critical');
create type policy_status as enum ('published','draft','archived');
create type workflow_state as enum ('draft','pending_review','approved','denied','escalated','closed');
create type decision_outcome as enum ('approved','denied','flagged','escalated');
create type approval_status as enum ('pending','approved','denied');
create type compliance_state as enum ('compliant','pending','expired','not_applicable');
create type vendor_status as enum ('approved','under_review','denied','expiring');
create type opportunity_status as enum ('tracking','qualifying','bid','submitted','won','lost','no_bid');
create type pack_status as enum ('generated','generating','archived');

-- Core tables ------------------------------------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sector      sector not null,
  tier        org_tier not null default 'pilot',
  created_at  timestamptz not null default now()
);

create table users (
  id              uuid primary key default gen_random_uuid(),
  auth_id         uuid unique,                 -- references auth.users(id)
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  email           text not null unique,
  role            user_role not null default 'viewer',
  title           text,
  status          user_status not null default 'active',
  avatar_color    text not null default '#2563eb',
  last_active_at  timestamptz not null default now()
);

create table policies (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_id        uuid references users(id),
  name            text not null,
  category        text not null,
  version         text not null,
  status          policy_status not null default 'draft',
  description     text not null default '',
  rules_count     int not null default 0,
  last_updated    timestamptz not null default now()
);

create table workflows (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_id        uuid references users(id),
  name            text not null,
  ai_system       text not null,
  state           workflow_state not null default 'draft',
  risk_level      risk_level not null default 'medium',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table workflow_events (
  id          uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  state       workflow_state not null,
  actor_id    uuid references users(id),
  note        text,
  at          timestamptz not null default now()
);

create table decisions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  workflow_id     uuid not null references workflows(id),
  reviewer_id     uuid references users(id),
  ai_system       text not null,
  policy_rule     text not null,
  outcome         decision_outcome not null,
  risk_level      risk_level not null,
  rationale       text not null default '',
  evidence_hash   text not null,
  timestamp       timestamptz not null default now()
);

create table approvals (
  id          uuid primary key default gen_random_uuid(),
  decision_id uuid not null references decisions(id) on delete cascade,
  reviewer_id uuid not null references users(id),
  status      approval_status not null default 'pending',
  comment     text,
  at          timestamptz not null default now()
);

create table evidence_packs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  responsible_id  uuid references users(id),
  title           text not null,
  hash            text not null,
  status          pack_status not null default 'generating',
  formats         text[] not null default '{}',
  size_kb         int not null default 0,
  decision_ids    text[] not null default '{}',
  generated_at    timestamptz not null default now()
);

create table audit_events (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id        uuid references users(id),
  type            text not null,
  target          text not null,
  summary         text not null,
  hash            text not null,
  prev_hash       text not null,
  at              timestamptz not null default now()
);

create table vendors (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  owner_id            uuid references users(id),
  name                text not null,
  category            text not null,
  status              vendor_status not null default 'under_review',
  risk_score          int not null default 0,
  security_review     compliance_state not null default 'pending',
  insurance           compliance_state not null default 'pending',
  soc2                compliance_state not null default 'pending',
  hipaa               compliance_state not null default 'not_applicable',
  fedramp             compliance_state not null default 'not_applicable',
  contract_expires_at timestamptz not null,
  approval_status     approval_status not null default 'pending'
);

create table procurement_opportunities (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  agency            text not null,
  name              text not null,
  naics             text not null,
  psc               text not null,
  status            opportunity_status not null default 'tracking',
  match_score       int not null default 0,
  estimated_value   numeric not null default 0,
  required_controls text[] not null default '{}',
  capability_gaps   text[] not null default '{}',
  proposal_deadline timestamptz not null,
  description       text not null default ''
);

create table risk_assessments (
  id           uuid primary key default gen_random_uuid(),
  vendor_id    uuid references vendors(id) on delete cascade,
  subject_type text not null,
  subject_name text not null,
  score        int not null,
  level        risk_level not null,
  factors      jsonb not null default '[]',
  assessed_at  timestamptz not null default now()
);

create table organization_settings (
  organization_id       uuid primary key references organizations(id) on delete cascade,
  require_dual_approval  boolean not null default true,
  auto_generate_evidence boolean not null default true,
  notify_on_violation    boolean not null default true,
  retention_days         int not null default 2555,
  risk_threshold         int not null default 70,
  data_region            text not null default 'us-east'
);

-- Indexes ----------------------------------------------------------------
create index on users (organization_id);
create index on policies (organization_id);
create index on workflows (organization_id);
create index on decisions (organization_id);
create index on evidence_packs (organization_id);
create index on audit_events (organization_id);
create index on vendors (organization_id);
create index on procurement_opportunities (organization_id);

-- Row-level security: tenant isolation by organization -------------------
-- Helper: the caller's organization, resolved from the users table.
create or replace function current_org_id() returns uuid
  language sql stable as $$
    select organization_id from users where auth_id = auth.uid() limit 1;
  $$;

do $$
declare t text;
begin
  foreach t in array array[
    'organizations','users','policies','workflows','workflow_events',
    'decisions','approvals','evidence_packs','audit_events','vendors',
    'procurement_opportunities','risk_assessments','organization_settings'
  ] loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- Org-scoped read policy on org-bearing tables.
create policy org_read_organizations on organizations
  for select using (id = current_org_id());

create policy org_rw_users on users
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_policies on policies
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_workflows on workflows
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_decisions on decisions
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_evidence on evidence_packs
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_audit on audit_events
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_vendors on vendors
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_opps on procurement_opportunities
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());

create policy org_rw_settings on organization_settings
  using (organization_id = current_org_id())
  with check (organization_id = current_org_id());
