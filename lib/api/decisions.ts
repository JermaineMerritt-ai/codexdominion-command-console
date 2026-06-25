import type { PolicyDecision } from "@/types";

export async function fetchPolicyDecisions(): Promise<PolicyDecision[]> {
  return [
    {
      id: "CDX-2024-047",
      policyRule: "HIPAA §164.312(a)(1) — Access Control",
      status: "approved",
      reviewer: "Dr. Sarah Chen",
      timestamp: "2024-11-18T14:32:00Z",
      evidenceHash:
        "sha256:a3f8c21e4d7b9f0e1c2d3a4b5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
      framework: "HIPAA",
    },
    {
      id: "CDX-2024-051",
      policyRule: "FedRAMP AC-2 — Account Management",
      status: "pending",
      reviewer: "James Okafor",
      timestamp: "2024-11-19T09:15:00Z",
      evidenceHash:
        "sha256:b4e9d32f5a8c0e1f2d3c4b5a6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
      framework: "FedRAMP",
    },
    {
      id: "CDX-2024-039",
      policyRule: "SOC 2 CC6.1 — Logical Access Controls",
      status: "approved",
      reviewer: "Amara Osei",
      timestamp: "2024-11-15T11:00:00Z",
      evidenceHash:
        "sha256:c5f0e43a6b9d1f2e3d4c5b6a7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
      framework: "SOC 2",
    },
    {
      id: "CDX-2024-055",
      policyRule: "NIST SP 800-53 AU-2 — Event Logging",
      status: "rejected",
      reviewer: "Dr. Sarah Chen",
      timestamp: "2024-11-20T16:45:00Z",
      evidenceHash:
        "sha256:d6a1f54b7c0e2f3e4d5c6b7a8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
      framework: "NIST",
    },
    {
      id: "CDX-2024-058",
      policyRule: "ISO 27001 A.9.4.1 — Information Access Restriction",
      status: "pending",
      reviewer: "Marcus Webb",
      timestamp: "2024-11-21T08:30:00Z",
      evidenceHash:
        "sha256:e7b2a65c8d1f3a4e5d6c7b8a9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
      framework: "ISO 27001",
    },
    {
      id: "CDX-2024-060",
      policyRule: "CMMC Level 2 — SC.3.177 Cryptographic Protection",
      status: "draft",
      reviewer: "—",
      timestamp: "2024-11-22T10:00:00Z",
      evidenceHash: "",
      framework: "CMMC",
    },
  ];
}
