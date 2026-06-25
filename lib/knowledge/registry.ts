import {
  getActiveOrganization,
  getAuditEvents,
  getDecisions,
  getEvidencePacks,
  getOpportunities,
  getPolicies,
  getUsers,
  getVendors,
  getWorkflows,
} from "@/lib/data/queries";
import { getModules } from "@/lib/modules/registry";
import { buildKnowledgeGraph } from "./graph";
import type { OrganizationKnowledgeGraph } from "./types";

/** Assemble the governed organization knowledge graph from all data sources. */
export async function getKnowledgeGraph(): Promise<OrganizationKnowledgeGraph> {
  const [
    org,
    policies,
    vendors,
    decisions,
    evidencePacks,
    auditEvents,
    workflows,
    opportunities,
    users,
    modules,
  ] = await Promise.all([
    getActiveOrganization(),
    getPolicies(),
    getVendors(),
    getDecisions(),
    getEvidencePacks(),
    getAuditEvents(),
    getWorkflows(),
    getOpportunities(),
    getUsers(),
    getModules(),
  ]);

  return buildKnowledgeGraph(
    {
      organizationName: org.name,
      policies,
      vendors,
      decisions,
      evidencePacks,
      auditEvents,
      workflows,
      opportunities,
      users,
      modules,
    },
    new Date(),
  );
}
