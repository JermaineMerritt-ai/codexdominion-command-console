import {
  LayoutDashboard,
  Terminal,
  Gavel,
  FileCheck2,
  Building2,
  ShieldAlert,
  ScrollText,
  Workflow,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Executive governance overview",
      },
      {
        title: "Command",
        href: "/command",
        icon: Terminal,
        description: "Governed natural-language workspace",
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        title: "Decisions",
        href: "/decisions",
        icon: Gavel,
        description: "AI policy decision center",
      },
      {
        title: "Workflows",
        href: "/workflows",
        icon: Workflow,
        description: "Approval workflow tracking",
      },
      {
        title: "Policies",
        href: "/policies",
        icon: ScrollText,
        description: "Policy management",
      },
      {
        title: "Evidence",
        href: "/evidence",
        icon: FileCheck2,
        description: "Evidence pack generation",
      },
    ],
  },
  {
    label: "Risk & Supply",
    items: [
      {
        title: "Vendors",
        href: "/vendors",
        icon: Building2,
        description: "Vendor governance",
      },
      {
        title: "Procurement",
        href: "/procurement",
        icon: ShieldAlert,
        description: "Procurement readiness",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Users",
        href: "/users",
        icon: Users,
        description: "User & role management",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Organization settings",
      },
    ],
  },
];

export const flatNav = navGroups.flatMap((g) => g.items);
