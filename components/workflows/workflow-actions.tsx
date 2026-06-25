"use client";

import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transitionWorkflow } from "@/lib/actions/governance";
import {
  nextStates,
  WORKFLOW_STATE_LABELS,
} from "@/lib/governance/transitions";
import type { WorkflowState } from "@/types";

export function WorkflowActions({
  workflowId,
  state,
}: {
  workflowId: string;
  state: WorkflowState;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const options = nextStates(state);

  if (options.length === 0) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Workflow is closed — no further transitions.
      </p>
    );
  }

  function move(toState: WorkflowState) {
    setError(null);
    startTransition(async () => {
      const res = await transitionWorkflow({ workflowId, toState });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="mt-3 border-t pt-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Move to:
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((s) => (
          <Button
            key={s}
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => move(s)}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {WORKFLOW_STATE_LABELS[s]}
          </Button>
        ))}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
