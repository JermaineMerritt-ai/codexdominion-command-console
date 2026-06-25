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
  Cpu,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { executeCommand } from "@/lib/actions/command";
import { ROLE_LABELS } from "@/lib/governance/rbac";
import type { CommandResult } from "@/lib/command/engine";
import type { ProviderInfo } from "@/lib/providers/types";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

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
  "active",
  "needs_integration",
  "planned",
  "inactive",
  "healthy",
  "degraded",
  "offline",
  "unknown",
]);

function RowBadge({ row }: { row: CommandResult["rows"][number] }) {
  if (!row.badge) return null;
  if (row.badgeStatus && KNOWN_STATUSES.has(row.badgeStatus))
    return <StatusBadge status={row.badgeStatus} />;
  return <Badge variant="neutral">{row.badge}</Badge>;
}

function providerStatus(p: ProviderInfo) {
  if (p.connected) return { label: "Active", cls: "text-success", dot: "bg-success" };
  if (p.available) return { label: "Preview", cls: "text-warning", dot: "bg-warning" };
  return { label: "Not configured", cls: "text-muted-foreground", dot: "bg-muted-foreground/40" };
}

export function CommandWorkspace({
  role,
  suggestions,
  providers,
}: {
  role: UserRole;
  suggestions: string[];
  providers: ProviderInfo[];
}) {
  const [input, setInput] = React.useState("");
  const [provider, setProvider] = React.useState("codex");
  const [history, setHistory] = React.useState<CommandResult[]>([]);
  const [pending, startTransition] = React.useTransition();

  function run(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    setInput("");
    startTransition(async () => {
      const result = await executeCommand(text, provider);
      setHistory((h) => [result, ...h]);
    });
  }

  const latest = history[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
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
                  placeholder="Ask CodexDominion…  e.g. Review system risk posture"
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
              CodexDominion governs every request — parsed, permission-checked, and
              audited — then routes execution to the selected provider. Acting as{" "}
              <span className="font-medium text-foreground">{ROLE_LABELS[role]}</span>.
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

        {latest && (
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {latest.ok && !latest.error ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : latest.error?.includes("permitted") ? (
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  {latest.intentLabel}
                </CardTitle>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  <Badge variant="default" className="gap-1">
                    <Cpu className="h-3 w-3" /> {latest.providerLabel}
                  </Badge>
                  {latest.riskLevel && <StatusBadge status={latest.riskLevel} />}
                </div>
              </div>
              <p className="pt-1 text-sm text-muted-foreground">
                {latest.error ?? latest.summary}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {latest.plan && latest.plan.length > 0 && (
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Plan
                  </p>
                  <ul className="space-y-1">
                    {latest.plan.map((step) => (
                      <li key={step} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latest.rows.length > 0 && (
                <div className="divide-y rounded-md border">
                  {latest.rows.map((row) => {
                    const inner = (
                      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{row.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {row.id.startsWith("m") ? null : (
                              <span className="font-mono">{row.id} · </span>
                            )}
                            {row.subtitle}
                          </p>
                        </div>
                        <RowBadge row={row} />
                      </div>
                    );
                    return row.href ? (
                      <Link key={row.id} href={row.href as never} className="block hover:bg-muted/40">
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

              {latest.nextStep && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                  <span className="font-medium">Next step: </span>
                  {latest.nextStep}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
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
                {latest.auditEventId && (
                  <Link
                    href={"/settings" as never}
                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:bg-accent"
                    title="View in audit trail"
                  >
                    {latest.auditEventId}
                  </Link>
                )}
                <Badge variant="neutral" className="font-mono">
                  {latest.commandId}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4 lg:col-span-1">
        {/* Provider routing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> AI Routing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              CodexDominion governs the request; the provider assists with
              execution. Codex is always the governing layer.
            </p>
            {providers.map((p) => {
              const status = providerStatus(p);
              const selected = provider === p.id;
              return (
                <button
                  key={p.id}
                  disabled={!p.available}
                  onClick={() => setProvider(p.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-md border p-2.5 text-left transition-colors",
                    selected ? "border-primary bg-primary/5" : "hover:bg-accent",
                    !p.available && "opacity-60",
                  )}
                >
                  {selected ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className={cn("flex items-center gap-1 text-[11px]", status.cls)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                        {status.label}
                      </span>
                    </span>
                    <span className="block text-xs text-muted-foreground">{p.role}</span>
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
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
                  <li key={`${h.commandId}-${i}`} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {h.ok && !h.error ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        {h.intentLabel}
                      </span>
                      <Badge variant="neutral" className="shrink-0">
                        {h.providerLabel}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      “{h.prompt}”
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {h.commandId}
                      {h.auditEventId ? ` · ${h.auditEventId}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
