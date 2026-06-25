"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Notification, Organization, User } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  notifications: Notification[];
  user: User;
  organization: Organization;
}

export function AppShell({
  children,
  notifications,
  user,
  organization,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Topbar
          onMenuClick={() => setMenuOpen(true)}
          notifications={notifications}
          user={user}
          organization={organization}
        />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
