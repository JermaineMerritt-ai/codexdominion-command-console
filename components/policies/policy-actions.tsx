"use client";

import * as React from "react";
import { Send, Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishPolicy, archivePolicy } from "@/lib/actions/governance";
import { can } from "@/lib/governance/rbac";
import type { PolicyStatus, UserRole } from "@/types";

export function PolicyActions({
  policyId,
  status,
  role,
}: {
  policyId: string;
  status: PolicyStatus;
  role: UserRole;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const canPublish = can(role, "publish_policy");
  const canArchive = can(role, "archive_policy");

  if (!canPublish && !canArchive) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

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
      {canPublish && status !== "published" && (
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
      {canArchive && status !== "archived" && (
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
