"use client";

import * as React from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveDecision, denyDecision } from "@/lib/actions/governance";
import type { ActionResult } from "@/lib/actions/governance";
import { can } from "@/lib/governance/rbac";
import type { DecisionOutcome, UserRole } from "@/types";

export function DecisionActions({
  decisionId,
  outcome,
  role,
}: {
  decisionId: string;
  outcome: DecisionOutcome;
  role: UserRole;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const allowed = can(role, "approve_decision");
  const actionable = outcome === "flagged" || outcome === "escalated";

  function run(fn: (i: { decisionId: string }) => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const res = await fn({ decisionId });
      if (!res.ok) setError(res.error);
    });
  }

  if (!actionable) {
    return (
      <p className="text-xs text-muted-foreground">
        No reviewer action required — decision is{" "}
        <span className="font-medium">{outcome}</span>.
      </p>
    );
  }

  if (!allowed) {
    return (
      <p className="text-xs text-muted-foreground">
        Your role cannot approve or deny decisions.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        onClick={() => run(approveDecision)}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => run(denyDecision)}
        disabled={pending}
      >
        <X className="h-4 w-4" />
        Deny
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
