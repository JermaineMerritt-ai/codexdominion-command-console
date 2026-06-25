import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Boxes,
  Network,
  ShieldCheck,
  Server,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { APP_MODE, dataSourceLabel } from "@/lib/config";
import { requireAuth } from "@/lib/auth/actor";
import { PROVIDER_INFO } from "@/lib/providers/registry";
import { getModules } from "@/lib/modules/registry";
import { getKnowledgeGraph } from "@/lib/knowledge/registry";
import {
  getAuditEvents,
  getDecisions,
  getEvidencePacks,
  getPolicies,
  getUsers,
  getVendors,
  getWorkflows,
} from "@/lib/data/queries";
import { verifyAuditChain } from "@/lib/governance/audit";

export const metadata = { title: "Diagnostics" };
export const revalidate = 30;

export default async function DiagnosticsPage() {
  const [modules, graph, audit, decisions, workflows, policies, vendors, evidence, users] =
    await Promise.all([
      getModules(),
      getKnowledgeGraph(),
      getAuditEvents(),
      getDecisions(),
      getWorkflows(),
      getPolicies(),
      getVendors(),
      getEvidencePacks(),
      getUsers(),
    ]);

  const chain = verifyAuditChain(audit);
  const liveModules = modules.filter((m) => m.source);
  const connected = liveModules.filter((m) => m.source?.connection === "connected").length;
  const degraded = liveModules.filter((m) => m.source?.connection === "degraded").length;

  const overall =
    !chain.intact || degraded > 0 ? "attention" : "healthy";

  return (
    <div>
      <PageHeader
        title="System Diagnostics"
        description="Operational health of the governance control plane — environment, providers, modules, knowledge graph, and the tamper-evident audit chain."
      >
        <Badge variant={overall === "healthy" ? "success" : "warning"} className="gap-1">
          {overall === "healthy" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {overall === "healthy" ? "All systems healthy" : "Attention needed"}
        </Badge>
      </PageHeader>

      {/* Environment */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-4 w-4" /> Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kv label="App mode" value={APP_MODE} tone={APP_MODE === "database" ? "default" : "neutral"} />
          <Kv label="Data source" value={dataSourceLabel} tone="neutral" />
          <Kv label="Authentication" value={requireAuth ? "required" : "open (demo)"} tone={requireAuth ? "success" : "neutral"} />
          <Kv label="Audit chain" value={chain.intact ? "intact" : "broken"} tone={chain.intact ? "success" : "destructive"} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> AI Providers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PROVIDER_INFO.map((p) => (
              <Row
                key={p.id}
                label={p.name}
                sub={p.role}
                state={p.connected ? "ok" : p.available ? "preview" : "off"}
                stateLabel={p.connected ? "Active" : p.available ? "Preview" : "Not configured"}
              />
            ))}
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-4 w-4" /> Modules ({modules.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {modules.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.integrationMaturity}% integrated
                    {m.source ? ` · ${m.source.connection.replace("_", " ")}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusBadge status={m.health} />
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Knowledge graph */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-4 w-4" /> Knowledge Graph
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Entities" value={graph.stats.totalNodes} />
            <Metric label="Relationships" value={graph.stats.totalEdges} />
            <Metric label="Gaps" value={graph.stats.totalGaps} tone={graph.stats.totalGaps > 0 ? "warning" : undefined} />
          </CardContent>
        </Card>

        {/* Audit + data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Audit & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row
              label="Audit chain"
              sub={`${chain.total} events · ${chain.roots} root · ${chain.danglingRefs} dangling`}
              state={chain.intact ? "ok" : "off"}
              stateLabel={chain.intact ? "Intact" : "Broken"}
            />
            <div className="grid grid-cols-3 gap-3 text-center">
              <Metric label="Decisions" value={decisions.length} />
              <Metric label="Workflows" value={workflows.length} />
              <Metric label="Policies" value={policies.length} />
              <Metric label="Vendors" value={vendors.length} />
              <Metric label="Evidence" value={evidence.length} />
              <Metric label="Users" value={users.length} />
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Live module bindings: {connected} connected · {degraded} degraded ·{" "}
        {liveModules.length - connected - degraded} demo/ready. Registry pages
        revalidate every 30s.
      </p>
    </div>
  );
}

function Kv({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "default" | "neutral" | "success" | "destructive";
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <Badge variant={tone ?? "neutral"} className="mt-1 capitalize">
        {value}
      </Badge>
    </div>
  );
}

function Row({
  label,
  sub,
  state,
  stateLabel,
}: {
  label: string;
  sub: string;
  state: "ok" | "preview" | "off";
  stateLabel: string;
}) {
  const Icon = state === "ok" ? CheckCircle2 : state === "preview" ? AlertTriangle : XCircle;
  const cls = state === "ok" ? "text-success" : state === "preview" ? "text-warning" : "text-muted-foreground";
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-medium ${cls}`}>
        <Icon className="h-3.5 w-3.5" /> {stateLabel}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warning";
}) {
  return (
    <div className="rounded-md border bg-muted/30 py-2">
      <p className={`text-lg font-semibold ${tone === "warning" ? "text-warning" : ""}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
