import type { Vendor } from "@/types";

export async function fetchVendors(): Promise<Vendor[]> {
  return [
    {
      id: "VND-001",
      name: "MedTech Solutions LLC",
      category: "Healthcare IT",
      status: "active",
      riskLevel: "medium",
      approvalStatus: "approved",
      missingDocs: [],
      expiringCerts: [
        { name: "ISO 27001", expiresAt: "2024-12-08T00:00:00Z" },
      ],
      lastReviewed: "2024-09-15T00:00:00Z",
    },
    {
      id: "VND-002",
      name: "SecureCloud Partners",
      category: "Cloud Infrastructure",
      status: "active",
      riskLevel: "low",
      approvalStatus: "approved",
      missingDocs: [],
      expiringCerts: [],
      lastReviewed: "2024-10-01T00:00:00Z",
    },
    {
      id: "VND-003",
      name: "DataBridge Corp",
      category: "Data Integration",
      status: "under-review",
      riskLevel: "high",
      approvalStatus: "pending",
      missingDocs: [
        "SOC 2 Report",
        "Penetration Test Results",
        "Business Continuity Plan",
      ],
      expiringCerts: [
        { name: "SOC 2 Type II", expiresAt: "2024-11-30T00:00:00Z" },
      ],
      lastReviewed: "2024-08-20T00:00:00Z",
    },
    {
      id: "VND-004",
      name: "Axiom Analytics",
      category: "AI/ML Services",
      status: "active",
      riskLevel: "medium",
      approvalStatus: "approved",
      missingDocs: ["NIST AI RMF Assessment"],
      expiringCerts: [],
      lastReviewed: "2024-10-15T00:00:00Z",
    },
    {
      id: "VND-005",
      name: "FedNet Systems",
      category: "Federal IT",
      status: "suspended",
      riskLevel: "critical",
      approvalStatus: "rejected",
      missingDocs: [
        "FedRAMP Authorization",
        "CMMC Certification",
        "Financial Statements",
      ],
      expiringCerts: [],
      lastReviewed: "2024-07-01T00:00:00Z",
    },
  ];
}
