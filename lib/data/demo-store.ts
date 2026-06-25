import * as seed from "./seed";
import type {
  AuditEvent,
  Decision,
  EvidencePack,
  Notification,
  Organization,
  Policy,
  ProcurementOpportunity,
  RiskAssessment,
  User,
  Vendor,
  Workflow,
} from "@/types";

export interface DemoStore {
  organizations: Organization[];
  users: User[];
  policies: Policy[];
  workflows: Workflow[];
  decisions: Decision[];
  evidencePacks: EvidencePack[];
  auditEvents: AuditEvent[];
  vendors: Vendor[];
  opportunities: ProcurementOpportunity[];
  riskAssessments: RiskAssessment[];
  notifications: Notification[];
}

// Deep clone so mutations never touch the immutable seed constants.
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function init(): DemoStore {
  return {
    organizations: clone(seed.organizations),
    users: clone(seed.users),
    policies: clone(seed.policies),
    workflows: clone(seed.workflows),
    decisions: clone(seed.decisions),
    evidencePacks: clone(seed.evidencePacks),
    auditEvents: clone(seed.auditEvents),
    vendors: clone(seed.vendors),
    opportunities: clone(seed.opportunities),
    riskAssessments: clone(seed.riskAssessments),
    notifications: clone(seed.notifications),
  };
}

// Single mutable instance per server process. Survives HMR in dev; on
// serverless it lives for the lifetime of a warm instance — mutations are
// immediately reflected by revalidatePath in the same invocation. Cold starts
// reset to seed, which is the desired behavior for a shared public demo.
const globalForDemo = globalThis as unknown as { __codexDemoStore?: DemoStore };

export const demoStore: DemoStore =
  globalForDemo.__codexDemoStore ?? (globalForDemo.__codexDemoStore = init());

/** Most recent audit hash, for chaining the next event. */
export function latestDemoHash(): string {
  const sorted = [...demoStore.auditEvents].sort(
    (a, b) => +new Date(b.at) - +new Date(a.at),
  );
  return sorted[0]?.hash ?? "0x0";
}
