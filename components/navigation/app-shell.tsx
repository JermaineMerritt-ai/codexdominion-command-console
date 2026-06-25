"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import type { Notification, Organization, User } from "@/types";
import type { Locale } from "@/lib/i18n/locales";

interface AppShellProps {
  children: React.ReactNode;
  notifications: Notification[];
  user: User;
  organization: Organization;
  authEnabled?: boolean;
  initialLocale?: Locale;
}

export function AppShell({
  children,
  notifications,
  user,
  organization,
  authEnabled = false,
  initialLocale,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <LocaleProvider initialLocale={initialLocale}>
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Topbar
          onMenuClick={() => setMenuOpen(true)}
          notifications={notifications}
          user={user}
          organization={organization}
          authEnabled={authEnabled}
        />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
    </LocaleProvider>
  );
}
