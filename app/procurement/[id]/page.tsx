import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  Target,
  Building,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { getOpportunities, getOpportunity } from "@/lib/data/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getOpportunities()).map((o) => ({ id: o.id }));
}

export default async function OpportunityDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = await getOpportunity(id);
  if (!o) notFound();

  const readiness = Math.max(
    0,
    100 - o.capabilityGaps.length * 18 - (100 - o.matchScore) / 3,
  );

  return (
    <div>
      <Link
        href="/procurement"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Procurement
      </Link>

      <PageHeader title={o.name} description={`${o.agency} · ${o.id}`}>
        <StatusBadge status={o.status} />
        <Button size="sm">Build Capture Plan</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{o.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field icon={Building} label="Agency" value={o.agency} />
                <Field label="NAICS" value={o.naics} />
                <Field label="PSC" value={o.psc} />
                <Field
                  icon={Target}
                  label="Match Score"
                  value={`${o.matchScore} / 100`}
                />
                <Field
                  label="Estimated Value"
                  value={formatCurrency(o.estimatedValue)}
                />
                <Field
                  icon={CalendarClock}
                  label="Proposal Deadline"
                  value={formatDate(o.proposalDeadline)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {o.requiredControls.map((c) => {
                const gap = o.capabilityGaps.some((g) =>
                  g.toLowerCase().includes(c.toLowerCase().split(" ")[0]),
                );
                return (
                  <Badge
                    key={c}
                    variant={gap ? "warning" : "success"}
                    className="gap-1"
                  >
                    {gap ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {c}
                  </Badge>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capability Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              {o.capabilityGaps.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> No open capability gaps —
                  fully qualified.
                </p>
              ) : (
                <ul className="space-y-2">
                  {o.capabilityGaps.map((g) => (
                    <li
                      key={g}
                      className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3 text-sm"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bid Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-semibold">
                  {Math.round(readiness)}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
              <Progress value={readiness} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                Derived from match score and open capability gaps.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Confirm control coverage with compliance
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Assign capture lead & color teams
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Generate compliance evidence pack
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Building;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
