"use client";

import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/12">
        <AlertOctagon className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred while loading this view.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
