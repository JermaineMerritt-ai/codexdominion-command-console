import { APP_MODE } from "@/lib/config";
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

/** Demo implementation — typed seed records, resolved immediately. */
export const seedRepository: DataRepository = {
  async organizations() {
    return seed.organizations;
  },
  async users() {
    return seed.users;
  },
  async policies() {
    return seed.policies;
  },
  async workflows() {
    return seed.workflows;
  },
  async decisions() {
    return seed.decisions;
  },
  async evidencePacks() {
    return seed.evidencePacks;
  },
  async vendors() {
    return seed.vendors;
  },
  async opportunities() {
    return seed.opportunities;
  },
  async auditEvents() {
    return seed.auditEvents;
  },
  async notifications() {
    return seed.notifications;
  },
  async riskAssessments() {
    return seed.riskAssessments;
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
