"use client";

import * as React from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/governance/rbac";
import type { User } from "@/types";

export function UserMenu({
  user,
  authEnabled,
}: {
  user: User;
  authEnabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md p-1 hover:bg-accent"
        aria-label="User menu"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: user.avatarColor }}
        >
          {initials}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-md border bg-card shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          {authEnabled ? (
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-accent"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          ) : (
            <p className="px-4 py-2.5 text-xs text-muted-foreground">
              Demo session — sign-in disabled.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
