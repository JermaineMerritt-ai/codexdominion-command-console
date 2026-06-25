"use client";

import * as React from "react";
import Link from "next/link";
import {
  Terminal,
  Loader2,
  CornerDownLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { executeCommand } from "@/lib/actions/command";
import { ROLE_LABELS } from "@/lib/governance/rbac";
import type { CommandResult } from "@/lib/command/engine";
import type { UserRole } from "@/types";

const KNOWN_STATUSES = new Set([
  "low",
  "medium",
  "high",
  "critical",
  "approved",
  "denied",
  "flagged",
  "escalated",
  "pending_review",
  "under_review",
  "expiring",
]);

function RowBadge({ row }: { row: CommandResult["rows"][number] }) {
  if (!row.badge) return null;
  if (row.badgeStatus && KNOWN_STATUSES.has(row.badgeStatus))
    return <StatusBadge status={row.badgeStatus} />;
  return <Badge variant="neutral">{row.badge}</Badge>;
}

export function CommandWorkspace({
  role,
  suggestions,
}: {
  role: UserRole;
  suggestions: string[];
}) {
  const [input, setInput] = React.useState("");
  const [history, setHistory] = React.useState<CommandResult[]>([]);
  const [pending, startTransition] = React.useTransition();

  function run(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    setInput("");
    startTransition(async () => {
      const result = await executeCommand(text);
      setHistory((h) => [result, ...h]);
    });
  }

  const latest = history[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {/* Prompt bar */}
        <Card>
          <CardContent className="pt-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(input);
              }}
            >
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                <Terminal className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask CodexDominion…  e.g. Show high-risk decisions"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button type="submit" size="sm" disabled={pending || !input.trim()}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CornerDownLeft className="h-4 w-4" />
                  )}
                  Run
                </Button>
              </div>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Governed command interface — every command is access-controlled and
              written to the audit trail. Acting as{" "}
              <span className="font-medium text-foreground">
                {ROLE_LABELS[role]}
              </span>
              .
            </p>

            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Suggested
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => run(s)}
                    disabled={pending}
                    className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result panel */}
        {latest && (
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  {latest.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : latest.error?.includes("permitted") ? (
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  {latest.intentLabel}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {latest.error ?? latest.summary}
                </p>
              </div>
              {latest.auditEventId && (
                <Badge variant="neutral" className="shrink-0 font-mono">
                  {latest.auditEventId}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {latest.rows.length > 0 && (
                <div className="divide-y rounded-md border">
                  {latest.rows.map((row) => {
                    const inner = (
                      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {row.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            <span className="font-mono">{row.id}</span> ·{" "}
                            {row.subtitle}
                          </p>
                        </div>
                        <RowBadge row={row} />
                      </div>
                    );
                    return row.href ? (
                      <Link
                        key={row.id}
                        href={row.href as never}
                        className="block hover:bg-muted/40"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div key={row.id}>{inner}</div>
                    );
                  })}
                </div>
              )}

              {latest.recommendedActions.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recommended actions
                  </p>
                  <ul className="space-y-1">
                    {latest.recommendedActions.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latest.evidenceLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {latest.evidenceLinks.map((l) => (
                    <Link
                      key={l.href + l.label}
                      href={l.href as never}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" /> Execution Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No commands yet. Try a suggested prompt to begin.
            </p>
          ) : (
            <ol className="space-y-3">
              {history.map((h, i) => (
                <li
                  key={`${h.auditEventId ?? "x"}-${i}`}
                  className="rounded-md border p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      {h.ok ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                      {h.intentLabel}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    “{h.prompt}”
                  </p>
                  {h.auditEventId && (
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {h.auditEventId}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
