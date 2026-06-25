"use client";

import * as React from "react";
import { Send, Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishPolicy, archivePolicy } from "@/lib/actions/governance";
import type { PolicyStatus } from "@/types";

export function PolicyActions({
  policyId,
  status,
}: {
  policyId: string;
  status: PolicyStatus;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function run(kind: "publish" | "archive") {
    setError(null);
    startTransition(async () => {
      const res =
        kind === "publish"
          ? await publishPolicy({ policyId })
          : await archivePolicy({ policyId });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status !== "published" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run("publish")}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Publish
        </Button>
      )}
      {status !== "archived" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => run("archive")}
          title="Archive policy"
        >
          <Archive className="h-4 w-4" />
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
