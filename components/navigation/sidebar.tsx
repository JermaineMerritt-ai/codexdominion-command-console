"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import { navGroups } from "./nav-config";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">CodexDominion</p>
              <p className="text-[11px] text-muted-foreground">
                Command Console
              </p>
            </div>
          </Link>
          <button
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">CodexDominion 5.0</p>
            <p className="mt-0.5">AI Governance Control Plane</p>
          </div>
        </div>
      </aside>
    </>
  );
}
