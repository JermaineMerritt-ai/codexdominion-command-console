"use client";

import { Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { NotificationsMenu } from "./notifications-menu";
import { ThemeToggle } from "./theme-toggle";
import type { Notification, Organization, User } from "@/types";

interface TopbarProps {
  onMenuClick: () => void;
  notifications: Notification[];
  user: User;
  organization: Organization;
}

export function Topbar({
  onMenuClick,
  notifications,
  user,
  organization,
}: TopbarProps) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

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
        <div className="mr-2 hidden text-right sm:block">
          <p className="text-xs font-medium leading-tight">
            {organization.name}
          </p>
          <p className="text-[11px] capitalize text-muted-foreground">
            {organization.sector} · {organization.tier}
          </p>
        </div>
        <NotificationsMenu notifications={notifications} />
        <ThemeToggle />
        <div
          className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: user.avatarColor }}
          title={`${user.name} · ${user.title}`}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
