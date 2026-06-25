import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Compass className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        The console route you requested doesn&apos;t exist or has moved.
      </p>
      <Link href="/dashboard" className={buttonVariants({ className: "mt-6" })}>
        Return to dashboard
      </Link>
    </div>
  );
}
