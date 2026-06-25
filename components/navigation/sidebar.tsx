"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  PackageOpen,
  ShoppingBag,
  Shield,
  Settings,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Policy Decisions", href: "/decisions", icon: FileCheck2, badge: 17 },
  { label: "Evidence Packs", href: "/evidence", icon: PackageOpen },
  { label: "Procurement", href: "/procurement", icon: ShoppingBag },
  { label: "Vendor Risk", href: "/vendors", icon: Shield, badge: 3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none tracking-tight">CodexDominion</span>
          <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
            Command Console
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && (
                    <Badge variant="info" className="px-1.5 py-0 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
            SC
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">System Admin</p>
            <p className="truncate text-[11px] text-sidebar-foreground/50">admin@codexdominion.io</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
