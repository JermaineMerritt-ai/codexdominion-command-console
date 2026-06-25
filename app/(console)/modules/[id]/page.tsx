import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  GitBranch,
  Lightbulb,
} from "lucide-react";
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
import { getModule, getModules } from "@/lib/modules/registry";
import { formatDateTime } from "@/lib/utils";

const CONTRACT_CAPS = [
  "workflows",
  "decisions",
  "evidence",
  "policies",
  "audit",
  "risk",
];

export async function generateStaticParams() {
  return (await getModules()).map((m) => ({ id: m.id }));
}

export default async function ModuleDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await getModule(id);
  if (!m) notFound();

  return (
    <div>
      <Link
        href="/modules"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Module Registry
      </Link>

      <PageHeader title={m.name} description={`${m.category} · ${m.version}`}>
        <StatusBadge status={m.status} />
        <StatusBadge status={m.health} />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Workflows" value={String(m.metrics.activeWorkflows)} />
                <Field label="Decisions" value={String(m.metrics.openDecisions)} />
                <Field label="Evidence" value={String(m.metrics.evidenceItems)} />
                <Field label="Risk flags" value={String(m.metrics.riskFlags)} />
                <Field label="Owner" value={m.owner} />
                <Field
                  label="Last sync"
                  value={m.lastSync === "never" ? "never" : formatDateTime(m.lastSync)}
                />
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Repository</p>
                  <p className="inline-flex items-center gap-1 font-mono text-xs">
                    <GitBranch className="h-3 w-3" /> {m.repositoryUrl}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Section title="Workflows" rows={m.workflows.map((w) => ({ id: w.id, title: w.name, sub: `state: ${w.state}`, status: w.riskLevel }))} empty="No workflows reported." />
          <Section title="Decisions" rows={m.decisions.map((d) => ({ id: d.id, title: d.summary, sub: `outcome: ${d.outcome}`, status: d.riskLevel }))} empty="No decisions reported." />
          <Section title="Evidence" rows={m.evidence.map((e) => ({ id: e.id, title: e.title, sub: e.id, status: e.status }))} empty="No evidence reported." />
          <Section title="Policies" rows={m.policies.map((p) => ({ id: p.id, title: p.name, sub: p.id, status: p.status }))} empty="No policies reported." />
          <Section title="Audit events" rows={m.auditEvents.map((a) => ({ id: a.id, title: a.summary, sub: `${a.type} · ${formatDateTime(a.at)}` }))} empty="No audit events reported." />
          <Section title="Risk items" rows={m.riskItems.map((r) => ({ id: r.id, title: r.label, sub: "Risk item", status: r.level }))} empty="No risk items reported." />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Maturity</span>
                  <span className="font-medium">{m.integrationMaturity}%</span>
                </div>
                <Progress value={m.integrationMaturity} />
              </div>
              <ul className="space-y-1.5">
                {CONTRACT_CAPS.map((cap) => {
                  const present = m.capabilities.includes(cap);
                  return (
                    <li key={cap} className="flex items-center gap-2 text-sm capitalize">
                      {present ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      {cap}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {m.missingCapabilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Missing Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {m.missingCapabilities.map((c) => (
                  <Badge key={c} variant="warning" className="capitalize">
                    {c}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" /> Recommended Next Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{m.recommendedNextStep}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function Section({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { id: string; title: string; sub: string; status?: string }[];
  empty: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {rows.length === 0 ? (
          <p className="px-5 text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{r.id}</span> · {r.sub}
                  </p>
                </div>
                {r.status && <StatusBadge status={r.status} />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
