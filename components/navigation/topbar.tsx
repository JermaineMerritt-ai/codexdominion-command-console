"use client";

import { Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { NotificationsMenu } from "./notifications-menu";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { ROLE_LABELS } from "@/lib/governance/rbac";
import type { Notification, Organization, User } from "@/types";

interface TopbarProps {
  onMenuClick: () => void;
  notifications: Notification[];
  user: User;
  organization: Organization;
  authEnabled: boolean;
}

export function Topbar({
  onMenuClick,
  notifications,
  user,
  organization,
  authEnabled,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 md:block">
        <GlobalSearch />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        <div className="mr-1 hidden text-right sm:block">
          <p className="text-xs font-medium leading-tight">
            {organization.name}
          </p>
          <p className="text-[11px] capitalize text-muted-foreground">
            {organization.sector} · {organization.tier}
          </p>
        </div>
        <span
          className="mr-1 hidden rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary md:inline"
          title="Your role"
        >
          {ROLE_LABELS[user.role]}
        </span>
        <NotificationsMenu notifications={notifications} />
        <LanguageSelector />
        <ThemeToggle />
        <UserMenu user={user} authEnabled={authEnabled} />
      </div>
    </header>
  );
}
