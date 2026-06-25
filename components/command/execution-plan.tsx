"use client";

import * as React from "react";
import {
  ListChecks,
  Clock,
  Boxes,
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Play,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ExecutionPlan, ExecutionRun } from "@/lib/execution/types";

export function ExecutionPlanCard({
  plan,
  pending,
  onApprove,
  onCancel,
}: {
  plan: ExecutionPlan;
  pending: boolean;
  onApprove: (plan: ExecutionPlan) => void;
  onCancel: () => void;
}) {
  const [include, setInclude] = React.useState<Record<string, boolean>>(
    Object.fromEntries(plan.steps.map((s) => [s.key, s.include])),
  );

  function approve() {
    onApprove({
      ...plan,
      steps: plan.steps.map((s) => ({ ...s, include: include[s.key] ?? true })),
    });
  }

  const activeCount = plan.steps.filter(
    (s) => include[s.key] ?? true,
  ).length;

  return (
    <Card className="border-primary/40">
      <CardHeader className="space-y-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-primary" />
            Execution Plan — {plan.title}
          </CardTitle>
          <StatusBadge status={plan.riskLevel} />
        </div>
        <p className="pt-1 text-sm text-muted-foreground">
          CodexDominion proposes this plan. Review, edit, and approve — then it
          executes each step through the governed pipeline and audits everything.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> ~{plan.estimateMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5" /> {activeCount} steps
          </span>
          <span className="inline-flex items-center gap-1">
            <Boxes className="h-3.5 w-3.5" /> {plan.modules.join(", ")}
          </span>
          <Badge variant="neutral" className="font-mono">{plan.id}</Badge>
        </div>

        <ol className="space-y-2">
          {plan.steps.map((s, i) => {
            const checked = include[s.key] ?? true;
            return (
              <li
                key={s.key}
                className="flex items-center gap-3 rounded-md border p-2.5"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={s.kind === "report" || pending}
                  onChange={() =>
                    setInclude((m) => ({ ...m, [s.key]: !checked }))
                  }
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{s.title}</span>
                  {s.moduleHint && (
                    <span className="text-xs text-muted-foreground">
                      module: {s.moduleHint}
                    </span>
                  )}
                </span>
                {s.kind === "report" && (
                  <Badge variant="neutral">report</Badge>
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button size="sm" onClick={approve} disabled={pending || activeCount === 0}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Approve &amp; Execute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const STEP_ICON = {
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  skipped: <MinusCircle className="h-4 w-4 text-muted-foreground" />,
  pending: <Loader2 className="h-4 w-4 text-muted-foreground" />,
  running: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
};

export function ExecutionRunCard({ run }: { run: ExecutionRun }) {
  return (
    <Card>
      <CardHeader className="space-y-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {run.status === "completed" ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            {run.title} — executed
          </CardTitle>
          <Badge variant={run.status === "completed" ? "success" : "destructive"}>
            {run.stepsCompleted}/{run.stepsTotal} steps
          </Badge>
        </div>
        <p className="pt-1 text-sm text-muted-foreground">{run.executiveSummary}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="space-y-2">
          {run.steps.map((s) => (
            <li key={s.key} className="flex items-start gap-3 rounded-md border p-2.5">
              <span className="mt-0.5">{STEP_ICON[s.status]}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{s.title}</span>
                  {s.durationMs != null && (
                    <span className="text-[11px] text-muted-foreground">
                      {s.durationMs}ms
                    </span>
                  )}
                </span>
                {s.summary && (
                  <span className="block text-xs text-muted-foreground">
                    {s.summary}
                  </span>
                )}
                {s.auditEventId && (
                  <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                    {s.auditEventId}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
        {run.planAuditId && (
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Plan sealed in audit trail:{" "}
            <span className="font-mono">{run.planAuditId}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
