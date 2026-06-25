import Link from "next/link";
import {
  Network,
  AlertTriangle,
  GitFork,
  ShieldCheck,
  ScrollText,
  Building2,
  Gavel,
  FileCheck2,
  Workflow as WorkflowIcon,
  Boxes,
  Target,
  Cpu,
  Users as UsersIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getKnowledgeGraph } from "@/lib/knowledge/registry";
import type { KnowledgeNodeType } from "@/lib/knowledge/types";

export const metadata = { title: "Knowledge" };
export const revalidate = 30;

const NODE_META: Record<
  KnowledgeNodeType,
  { label: string; icon: typeof Network; href?: string }
> = {
  organization: { label: "Organization", icon: Building2 },
  policy: { label: "Policies", icon: ScrollText, href: "/policies" },
  vendor: { label: "Vendors", icon: Building2, href: "/vendors" },
  decision: { label: "Decisions", icon: Gavel, href: "/decisions" },
  evidence: { label: "Evidence", icon: FileCheck2, href: "/evidence" },
  audit_event: { label: "Audit Events", icon: ShieldCheck, href: "/settings" },
  workflow: { label: "Workflows", icon: WorkflowIcon, href: "/workflows" },
  module: { label: "Modules", icon: Boxes, href: "/modules" },
  opportunity: { label: "Opportunities", icon: Target, href: "/procurement" },
  ai_system: { label: "AI Systems", icon: Cpu },
  user: { label: "Users", icon: UsersIcon, href: "/users" },
};

export default async function KnowledgePage() {
  const graph = await getKnowledgeGraph();
  const types = Object.keys(graph.stats.nodesByType) as KnowledgeNodeType[];

  return (
    <div>
      <PageHeader
        title="Organization Knowledge Graph"
        description="CodexDominion maintains a governed understanding of your environment — policies, vendors, contracts, evidence, decisions, workflows, modules, and AI systems — and the relationships between them."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Entities" value={graph.stats.totalNodes} icon={Network} />
        <Stat label="Relationships" value={graph.stats.totalEdges} icon={GitFork} />
        <Stat label="Knowledge Gaps" value={graph.stats.totalGaps} icon={AlertTriangle} tone="warning" />
        <Stat label="AI Systems" value={graph.stats.nodesByType.ai_system ?? 0} icon={Cpu} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {types
                  .filter((t) => t !== "organization")
                  .map((t) => {
                    const meta = NODE_META[t];
                    const Icon = meta.icon;
                    const count = graph.stats.nodesByType[t] ?? 0;
                    const inner = (
                      <div className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold leading-none">{count}</p>
                          <p className="text-xs text-muted-foreground">{meta.label}</p>
                        </div>
                      </div>
                    );
                    return meta.href ? (
                      <Link key={t} href={meta.href as never}>{inner}</Link>
                    ) : (
                      <div key={t}>{inner}</div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {graph.sampleChains.map((c) => (
                  <li key={c} className="flex items-center gap-2 rounded-md border bg-muted/30 p-2.5 font-mono text-xs">
                    <GitFork className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                {graph.stats.totalEdges} governed relationships connect{" "}
                {graph.stats.totalNodes} entities. Execution plans reason over
                this graph instead of raw prompts.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Knowledge Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {graph.gaps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open gaps detected.</p>
            ) : (
              <ul className="space-y-2">
                {graph.gaps.slice(0, 12).map((g) => {
                  const inner = (
                    <div className="rounded-md border p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{g.label}</p>
                        <StatusBadge status={g.severity} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{g.detail}</p>
                    </div>
                  );
                  return g.href ? (
                    <li key={g.id}>
                      <Link href={g.href as never} className="block hover:opacity-80">
                        {inner}
                      </Link>
                    </li>
                  ) : (
                    <li key={g.id}>{inner}</li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Network;
  tone?: "warning";
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={`text-xl font-semibold ${tone === "warning" ? "text-warning" : ""}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
