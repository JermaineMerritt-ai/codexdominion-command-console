"use client";

import * as React from "react";
import { ShieldCheck, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeVendorReview } from "@/lib/actions/governance";
import type { VendorStatus } from "@/types";

export function VendorActions({
  vendorId,
  status,
}: {
  vendorId: string;
  status: VendorStatus;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  // Already-approved vendors have nothing to review.
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <Check className="h-3.5 w-3.5" /> Reviewed
      </span>
    );
  }

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await completeVendorReview({ vendorId });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={run}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        Mark reviewed
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
