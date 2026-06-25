import type { DashboardMetrics, ActivityEvent } from "@/types";

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return {
    totalPolicies: 142,
    pendingReviews: 17,
    approvedDecisions: 98,
    riskScore: 23,
    complianceRate: 94.7,
    openIncidents: 3,
  };
}

export async function fetchActivityFeed(): Promise<ActivityEvent[]> {
  return [
    {
      id: "1",
      type: "approval",
      title: "Policy CDX-2024-047 approved",
      description: "HIPAA data retention policy reviewed and approved",
      actor: "Dr. Sarah Chen",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "2",
      type: "review",
      title: "Evidence pack generated",
      description: "SOC 2 Type II evidence bundle compiled for Q4 audit",
      actor: "Compliance Engine",
      timestamp: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    },
    {
      id: "3",
      type: "alert",
      title: "Vendor certification expiring",
      description: "MedTech Solutions ISO 27001 certificate expires in 14 days",
      actor: "Risk Monitor",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "4",
      type: "decision",
      title: "Procurement match identified",
      description: "GSA Schedule 70 opportunity aligns with CDX-2024-031 controls",
      actor: "Procurement Engine",
      timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    },
    {
      id: "5",
      type: "review",
      title: "Policy CDX-2024-051 under review",
      description: "FedRAMP Moderate authorization controls pending review",
      actor: "James Okafor",
      timestamp: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
    },
  ];
}
