"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShieldAlert,
  Clock,
  FileCheck2,
  Workflow,
  Building2,
} from "lucide-react";
import type { Notification, NotificationType } from "@/types";
import { timeAgo } from "@/lib/utils";

const ICONS: Record<NotificationType, typeof Bell> = {
  policy_violation: ShieldAlert,
  pending_approval: Clock,
  evidence_generated: FileCheck2,
  workflow_assigned: Workflow,
  vendor_expiration: Building2,
};

export function NotificationsMenu({
  notifications,
}: {
  notifications: Notification[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-md border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
            <span className="text-xs text-muted-foreground">
              {unread} unread
            </span>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push(n.href as never);
                    }}
                    className="flex w-full gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-accent"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {!n.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                        <span className="truncate">{n.title}</span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {timeAgo(n.at)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
