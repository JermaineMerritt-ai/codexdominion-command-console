import { ExternalLink, TrendingUp, AlertCircle } from "lucide-react";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchOpportunities } from "@/lib/api/procurement";
import { formatDate } from "@/lib/utils";
import type { ProcurementStatus } from "@/types";

export const metadata = { title: "Procurement — CodexDominion" };

type ProcurementBadgeVariant = "success" | "warning" | "neutral" | "destructive";

const statusConfig: Record<
  ProcurementStatus,
  { label: string; variant: ProcurementBadgeVariant }
> = {
  active: { label: "Active", variant: "success" },
  gap: { label: "Gap", variant: "warning" },
  awarded: { label: "Awarded", variant: "success" },
  closed: { label: "Closed", variant: "neutral" },
};

function MatchScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${
            score >= 85 ? "bg-emerald-500" : score >= 65 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold">{score}%</span>
    </div>
  );
}

export default async function ProcurementPage() {
  const opportunities = await fetchOpportunities();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header
        title="Procurement"
        subtitle="Opportunity tracking with compliance match analysis"
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2.5">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {opportunities.filter((o) => o.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2.5">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {opportunities.filter((o) => o.status === "gap").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Compliance Gaps</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {opportunities
                      .reduce((sum, o) => {
                        const m = o.value.replace(/[^0-9.]/g, "");
                        return sum + parseFloat(m || "0");
                      }, 0)
                      .toFixed(1)}
                    M
                  </p>
                  <p className="text-xs text-muted-foreground">Total Pipeline Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opportunity Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-36">Match Score</TableHead>
                  <TableHead>Required Controls</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead className="w-28">Due Date</TableHead>
                  <TableHead className="w-24">Value</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp) => {
                  const status = statusConfig[opp.status];
                  return (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{opp.title}</p>
                          <p className="text-xs text-muted-foreground">{opp.agency}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <MatchScoreBar score={opp.matchScore} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {opp.requiredControls.map((ctrl) => (
                            <Badge key={ctrl} variant="info" className="px-1.5 text-[10px]">
                              {ctrl}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{opp.nextAction}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(opp.dueDate)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{opp.value}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
