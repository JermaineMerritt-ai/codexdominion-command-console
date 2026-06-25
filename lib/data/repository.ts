import { APP_MODE } from "@/lib/config";
import * as seed from "./seed";
import { demoStore } from "./demo-store";
import type {
  AuditEvent,
  Decision,
  EvidencePack,
  Notification,
  Organization,
  Policy,
  ProcurementOpportunity,
  RiskAssessment,
  SeriesPoint,
  User,
  Vendor,
  Workflow,
} from "@/types";

export interface DashboardSeries {
  decisionsOverTime: SeriesPoint[];
  policyViolations: SeriesPoint[];
  approvalTrends: SeriesPoint[];
  riskDistribution: SeriesPoint[];
}

/**
 * The data contract every page depends on. Two implementations satisfy it:
 * a synchronous seed layer (demo mode) and a Prisma-backed layer (database
 * mode). All methods are async so the two are interchangeable.
 */
export interface DataRepository {
  organizations(): Promise<Organization[]>;
  users(): Promise<User[]>;
  policies(): Promise<Policy[]>;
  workflows(): Promise<Workflow[]>;
  decisions(): Promise<Decision[]>;
  evidencePacks(): Promise<EvidencePack[]>;
  vendors(): Promise<Vendor[]>;
  opportunities(): Promise<ProcurementOpportunity[]>;
  auditEvents(): Promise<AuditEvent[]>;
  notifications(): Promise<Notification[]>;
  riskAssessments(): Promise<RiskAssessment[]>;
  dashboardSeries(): Promise<DashboardSeries>;
}

/**
 * Demo implementation — reads from the mutable in-memory demo store (seeded
 * from the typed seed layer). Live governance actions mutate this store so
 * reads reflect changes during a session.
 */
export const seedRepository: DataRepository = {
  async organizations() {
    return demoStore.organizations;
  },
  async users() {
    return demoStore.users;
  },
  async policies() {
    return demoStore.policies;
  },
  async workflows() {
    return demoStore.workflows;
  },
  async decisions() {
    return demoStore.decisions;
  },
  async evidencePacks() {
    return demoStore.evidencePacks;
  },
  async vendors() {
    return demoStore.vendors;
  },
  async opportunities() {
    return demoStore.opportunities;
  },
  async auditEvents() {
    return demoStore.auditEvents;
  },
  async notifications() {
    return demoStore.notifications;
  },
  async riskAssessments() {
    return demoStore.riskAssessments;
  },
  async dashboardSeries() {
    return {
      decisionsOverTime: seed.decisionsOverTime,
      policyViolations: seed.policyViolations,
      approvalTrends: seed.approvalTrends,
      riskDistribution: seed.riskDistribution,
    };
  },
};

let cached: DataRepository | null = null;

/**
 * Resolve the active repository for the current APP_MODE. The Prisma
 * implementation is imported dynamically so demo builds never need a
 * generated Prisma client or database credentials.
 */
export async function getRepository(): Promise<DataRepository> {
  if (cached) return cached;
  if (APP_MODE === "database") {
    const mod = await import("./repository.prisma");
    cached = mod.prismaRepository;
  } else {
    cached = seedRepository;
  }
  return cached;
}
