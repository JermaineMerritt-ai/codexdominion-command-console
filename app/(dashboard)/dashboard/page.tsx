import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Header } from "@/components/navigation/header";
import { MetricCard } from "@/components/cards/metric-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchDashboardMetrics, fetchActivityFeed } from "@/lib/api/dashboard";

export const metadata = { title: "Dashboard — CodexDominion" };

export default async function DashboardPage() {
  const [metrics, feed] = await Promise.all([
    fetchDashboardMetrics(),
    fetchActivityFeed(),
  ]);

  const recentApprovals = [
    {
      id: "CDX-2024-047",
      policy: "HIPAA §164.312(a)(1)",
      reviewer: "Dr. Sarah Chen",
      date: "Nov 18, 2024",
    },
    {
      id: "CDX-2024-039",
      policy: "SOC 2 CC6.1",
      reviewer: "Amara Osei",
      date: "Nov 15, 2024",
    },
    {
      id: "CDX-2024-033",
      policy: "NIST AC-17 Remote Access",
      reviewer: "James Okafor",
      date: "Nov 12, 2024",
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header
        title="Governance Dashboard"
        subtitle="Operational overview · CodexDominion 5.0"
      />
      <div className="flex-1 space-y-6 p-6">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              title="Total Policies"
              value={metrics.totalPolicies}
              icon={FileCheck2}
              variant="default"
              trend={{ value: 4.2, label: "this month" }}
            />
            <MetricCard
              title="Pending Reviews"
              value={metrics.pendingReviews}
              icon={Clock}
              variant="warning"
            />
            <MetricCard
              title="Approved Decisions"
              value={metrics.approvedDecisions}
              icon={CheckCircle2}
              variant="success"
              trend={{ value: 12, label: "vs last month" }}
            />
            <MetricCard
              title="Risk Score"
              value={metrics.riskScore}
              description="Lower is better"
              icon={AlertTriangle}
              variant="warning"
            />
            <MetricCard
              title="Compliance Rate"
              value={`${metrics.complianceRate}%`}
              icon={TrendingUp}
              variant="success"
              trend={{ value: 1.3, label: "vs last quarter" }}
            />
            <MetricCard
              title="Open Incidents"
              value={metrics.openIncidents}
              icon={Activity}
              variant="danger"
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityTimeline events={feed} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {[
                    { label: "Critical", count: 0, variant: "destructive" as const },
                    { label: "High", count: 1, variant: "destructive" as const },
                    { label: "Medium", count: 4, variant: "warning" as const },
                    { label: "Low", count: 12, variant: "success" as const },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <dt className="text-sm text-muted-foreground">{row.label} Risk</dt>
                      <dd className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              row.variant === "destructive"
                                ? "bg-red-500"
                                : row.variant === "warning"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${(row.count / 17) * 100}%` }}
                          />
                        </div>
                        <Badge variant={row.variant} className="min-w-[2rem] justify-center text-xs">
                          {row.count}
                        </Badge>
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recentApprovals.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-0.5 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {item.id}
                        </span>
                        <Badge variant="success" className="text-[10px]">
                          Approved
                        </Badge>
                      </div>
                      <span className="text-xs leading-relaxed text-muted-foreground">
                        {item.policy}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {item.reviewer} · {item.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
