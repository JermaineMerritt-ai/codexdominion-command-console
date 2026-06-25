import Link from "next/link";
import {
  Workflow as WorkflowIcon,
  Clock,
  Gavel,
  ShieldAlert,
  FileCheck2,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  DecisionsAreaChart,
  ViolationsBarChart,
  ApprovalTrendsChart,
  RiskDonut,
} from "@/components/dashboard/charts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import {
  approvalTrends,
  decisionsOverTime,
  policyViolations,
  riskDistribution,
} from "@/lib/data/seed";
import {
  getAuditReadinessScore,
  getComplianceStatus,
  getDashboardMetrics,
  getDecisions,
  getEvidencePacks,
  getUserName,
  getWorkflows,
} from "@/lib/data/queries";
import { formatDateTime, shortHash } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const m = getDashboardMetrics();
  const recentDecisions = getDecisions().slice(0, 5);
  const pendingReviews = getWorkflows()
    .filter((w) => w.state === "pending_review" || w.state === "escalated")
    .slice(0, 4);
  const recentEvidence = getEvidencePacks().slice(0, 4);
  const readiness = getAuditReadinessScore();
  const compliance = getComplianceStatus();

  return (
    <div>
      <PageHeader
        title="Governance Overview"
        description="Real-time posture across AI decisions, approvals, policy enforcement, and audit readiness."
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Active Workflows"
          value={m.activeWorkflows}
          icon={WorkflowIcon}
          delta={{ value: "+2 this week", direction: "up", positive: true }}
        />
        <MetricCard
          label="Pending Approvals"
          value={m.pendingApprovals}
          icon={Clock}
          accent="warning"
          hint="Awaiting reviewer action"
        />
        <MetricCard
          label="AI Decisions Today"
          value={m.decisionsToday}
          icon={Gavel}
          delta={{ value: "+18% vs avg", direction: "up", positive: true }}
        />
        <MetricCard
          label="Policy Violations"
          value={m.policyViolations}
          icon={ShieldAlert}
          accent="destructive"
          hint="Flagged or denied"
        />
        <MetricCard
          label="Evidence Packs"
          value={m.evidenceGenerated}
          icon={FileCheck2}
          accent="success"
          hint="Generated & ready"
        />
        <MetricCard
          label="High-Risk Vendors"
          value={m.highRiskVendors}
          icon={Building2}
          accent="warning"
          hint="Risk score ≥ 60"
        />
      </div>

      {/* Charts row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Decisions Over Time</CardTitle>
            <CardDescription>
              Daily automated decisions across all governed AI systems (14 days).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DecisionsAreaChart data={decisionsOverTime} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Open items by risk level.</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDonut data={riskDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Policy Violations by Category</CardTitle>
            <CardDescription>Last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ViolationsBarChart data={policyViolations} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approval Trends</CardTitle>
            <CardDescription>Approved vs. denied decisions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalTrendsChart data={approvalTrends} />
          </CardContent>
        </Card>
      </div>

      {/* Widgets */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent decisions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Decisions</CardTitle>
              <CardDescription>Latest governed AI outcomes.</CardDescription>
            </div>
            <Link
              href="/decisions"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y">
              {recentDecisions.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{d.id}</span>
                      <StatusBadge status={d.outcome} />
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {d.aiSystem} · {d.policyRule}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={d.riskLevel} />
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {shortHash(d.evidenceHash)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit readiness */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Readiness</CardTitle>
            <CardDescription>Composite examination-readiness score.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold tracking-tight">
                {readiness}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
            </div>
            <Progress value={readiness} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              Strong posture. Resolve open fairness flags to reach &ge; 95.
            </p>
            <div className="mt-4 space-y-3">
              {compliance.map((c) => (
                <div key={c.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      {c.state === "compliant" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      )}
                      {c.label}
                    </span>
                    <span className="text-muted-foreground">{c.pct}%</span>
                  </div>
                  <Progress
                    value={c.pct}
                    indicatorClassName={
                      c.state === "compliant" ? "bg-success" : "bg-warning"
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom widgets */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>Workflows awaiting action.</CardDescription>
            </div>
            <Link
              href="/workflows"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReviews.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{w.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {w.aiSystem} · {getUserName(w.ownerId)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={w.riskLevel} />
                  <StatusBadge status={w.state} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Evidence Packs</CardTitle>
              <CardDescription>Latest generated artifacts.</CardDescription>
            </div>
            <Link
              href="/evidence"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvidence.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {e.id} · {formatDateTime(e.generatedAt)}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
