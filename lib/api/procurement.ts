import type { ProcurementOpportunity } from "@/types";

export async function fetchOpportunities(): Promise<ProcurementOpportunity[]> {
  return [
    {
      id: "OPP-2024-GSA-001",
      title: "GSA Schedule 70 — IT Professional Services",
      agency: "General Services Administration",
      matchScore: 94,
      requiredControls: ["FedRAMP Moderate", "NIST 800-53", "CMMC L2"],
      nextAction: "Submit technical proposal",
      dueDate: "2024-12-15T17:00:00Z",
      value: "$2.4M",
      status: "active",
    },
    {
      id: "OPP-2024-HHS-003",
      title: "HHS AI Governance Platform",
      agency: "Dept. of Health & Human Services",
      matchScore: 88,
      requiredControls: ["HIPAA", "FedRAMP High", "NIST 800-53"],
      nextAction: "Complete security questionnaire",
      dueDate: "2024-12-22T17:00:00Z",
      value: "$5.1M",
      status: "active",
    },
    {
      id: "OPP-2024-DOD-007",
      title: "DoD AI Risk Management Platform",
      agency: "Department of Defense",
      matchScore: 76,
      requiredControls: ["CMMC L3", "NIST AI RMF", "DFARS"],
      nextAction: "Obtain CMMC Level 3 certification",
      dueDate: "2025-01-31T17:00:00Z",
      value: "$12.8M",
      status: "gap",
    },
    {
      id: "OPP-2024-VA-002",
      title: "VA Compliance Automation Services",
      agency: "Dept. of Veterans Affairs",
      matchScore: 91,
      requiredControls: ["HIPAA", "FedRAMP Moderate", "VA Handbook 6500"],
      nextAction: "Review solicitation amendments",
      dueDate: "2025-01-10T17:00:00Z",
      value: "$3.7M",
      status: "active",
    },
  ];
}
