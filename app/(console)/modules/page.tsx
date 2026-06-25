import Link from "next/link";
import { ArrowRight, GitBranch, Boxes, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { getModules, moduleStats } from "@/lib/modules/registry";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Modules" };

export default async function ModulesPage() {
  const modules = await getModules();
  const stats = moduleStats(modules);

  return (
    <div>
      <PageHeader
        title="Module Registry"
        description="Every CodexDominion app reports into the Console through the Integration Contract. This is what CodexDominion governs."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Registered Modules" value={stats.total} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Needs Integration" value={stats.needsIntegration} tone="warning" />
        <Stat label="Avg. Integration" value={`${stats.avgMaturity}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <CardHeader className="space-y-0 pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base leading-tight">
                  <Boxes className="h-4 w-4 shrink-0 text-primary" />
                  <span className="break-all">{m.name}</span>
                </CardTitle>
                <StatusBadge status={m.status} />
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                {m.category} · {m.version}
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={m.health} />
                {m.source && (
                  <Badge
                    variant={
                      m.source.connection === "connected"
                        ? "success"
                        : m.source.connection === "degraded"
                          ? "destructive"
                          : m.source.connection === "live_ready"
                            ? "warning"
                            : "neutral"
                    }
                  >
                    {m.source.connection === "connected"
                      ? "Live · Connected"
                      : m.source.connection === "degraded"
                        ? "Live · Degraded"
                        : m.source.connection === "live_ready"
                          ? "Live-ready"
                          : "Demo fallback"}
                  </Badge>
                )}
                {m.metrics.riskFlags > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {m.metrics.riskFlags} risk flag{m.metrics.riskFlags === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <Metric label="Workflows" value={m.metrics.activeWorkflows} />
                <Metric label="Decisions" value={m.metrics.openDecisions} />
                <Metric label="Evidence" value={m.metrics.evidenceItems} />
                <Metric label="Risks" value={m.metrics.riskFlags} />
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Integration maturity</span>
                  <span className="font-medium">{m.integrationMaturity}%</span>
                </div>
                <Progress value={m.integrationMaturity} />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Owner: {m.owner}</span>
                <span>Sync: {m.lastSync === "never" ? "never" : timeAgo(m.lastSync)}</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <GitBranch className="h-3.5 w-3.5" /> repo
                </span>
                <Link
                  href={`/modules/${m.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View module <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 py-2">
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "warning";
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone === "warning" ? "text-warning" : ""}`}>
        {value}
      </p>
    </Card>
  );
}
