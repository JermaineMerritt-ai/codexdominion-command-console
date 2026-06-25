import type { EvidencePack } from "@/types";

export async function fetchEvidencePacks(): Promise<EvidencePack[]> {
  return [
    {
      id: "EP-2024-Q4-001",
      name: "SOC 2 Type II — Q4 2024",
      framework: "SOC 2",
      generatedAt: "2024-11-18T14:00:00Z",
      policyCount: 24,
      controlCount: 87,
      status: "ready",
      fileSize: "4.2 MB",
    },
    {
      id: "EP-2024-HIPAA-003",
      name: "HIPAA Annual Compliance Bundle",
      framework: "HIPAA",
      generatedAt: "2024-11-10T09:30:00Z",
      policyCount: 31,
      controlCount: 112,
      status: "ready",
      fileSize: "6.1 MB",
    },
    {
      id: "EP-2024-FED-007",
      name: "FedRAMP Moderate ATO Package",
      framework: "FedRAMP",
      generatedAt: "2024-11-05T16:15:00Z",
      policyCount: 18,
      controlCount: 64,
      status: "generating",
      fileSize: null,
    },
    {
      id: "EP-2024-CMMC-002",
      name: "CMMC Level 2 Assessment Evidence",
      framework: "CMMC",
      generatedAt: "2024-10-28T11:00:00Z",
      policyCount: 15,
      controlCount: 53,
      status: "ready",
      fileSize: "3.8 MB",
    },
    {
      id: "EP-2024-ISO-001",
      name: "ISO 27001 Certification Evidence",
      framework: "ISO 27001",
      generatedAt: "2024-10-15T14:30:00Z",
      policyCount: 22,
      controlCount: 79,
      status: "archived",
      fileSize: "5.5 MB",
    },
  ];
}
