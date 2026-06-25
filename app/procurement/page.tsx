import Link from "next/link";
import { ArrowRight, CalendarClock, Target, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOpportunities } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Procurement" };

function matchTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export default async function ProcurementPage() {
  const opps = await getOpportunities();
  const pipeline = opps.reduce((a, o) => a + o.estimatedValue, 0);
  const active = opps.filter((o) =>
    ["qualifying", "bid", "submitted"].includes(o.status),
  ).length;

  return (
    <div>
      <PageHeader
        title="Procurement Readiness"
        description="Track government and enterprise opportunities, match scores, required controls, and capability gaps to win AI governance work."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Opportunities" value={String(opps.length)} />
        <Stat label="Active Pursuits" value={String(active)} />
        <Stat label="Pipeline Value" value={formatCurrency(pipeline)} />
        <Stat
          label="Won"
          value={String(opps.filter((o) => o.status === "won").length)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {opps.map((o) => (
          <Card key={o.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div className="min-w-0">
                <CardTitle className="text-base">{o.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.agency} · {o.id}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Match</p>
                  <p
                    className={`flex items-center gap-1 text-lg font-semibold ${matchTone(o.matchScore)}`}
                  >
                    <Target className="h-4 w-4" />
                    {o.matchScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(o.estimatedValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="flex items-center gap-1 text-sm font-medium">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDate(o.proposalDeadline)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="neutral">NAICS {o.naics}</Badge>
                <Badge variant="neutral">PSC {o.psc}</Badge>
                {o.requiredControls.slice(0, 2).map((c) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </div>

              {o.capabilityGaps.length > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-warning">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {o.capabilityGaps.length} capability gap
                  {o.capabilityGaps.length === 1 ? "" : "s"}
                </p>
              )}

              <div className="mt-4">
                <Link
                  href={`/procurement/${o.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View opportunity <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
