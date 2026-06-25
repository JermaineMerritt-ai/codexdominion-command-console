import { Check, Minus, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { getUsers } from "@/lib/data/queries";
import { timeAgo } from "@/lib/utils";
import type { UserRole } from "@/types";

export const metadata = { title: "Users" };

const ROLE_LABELS: Record<UserRole, string> = {
  administrator: "Administrator",
  compliance_officer: "Compliance Officer",
  reviewer: "Reviewer",
  auditor: "Auditor",
  executive: "Executive",
  viewer: "Viewer",
};

const CAPABILITIES = [
  "View",
  "Review & Approve",
  "Publish Policy",
  "Generate Evidence",
  "Manage Users",
] as const;

const MATRIX: Record<UserRole, boolean[]> = {
  administrator: [true, true, true, true, true],
  compliance_officer: [true, true, true, true, false],
  reviewer: [true, true, false, true, false],
  auditor: [true, false, false, true, false],
  executive: [true, false, false, false, false],
  viewer: [true, false, false, false, false],
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <PageHeader
        title="User & Role Management"
        description="Role-based access control across the governance control plane. Permissions are enforced per role."
      >
        <Button size="sm">
          <UserPlus className="h-4 w-4" /> Invite User
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            What each role can do in the Command Console.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-y bg-muted/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Role</th>
                {CAPABILITIES.map((c) => (
                  <th key={c} className="px-4 py-3 text-center">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {(Object.keys(MATRIX) as UserRole[]).map((role) => (
                <tr key={role} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{ROLE_LABELS[role]}</td>
                  {MATRIX[role].map((allowed, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {allowed ? (
                        <Check className="mx-auto h-4 w-4 text-success" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>{users.length} users in this organization.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-y bg-muted/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("");
                return (
                  <tr key={u.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: u.avatarColor }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.title}</td>
                    <td className="px-5 py-3">
                      <Badge variant="default">{ROLE_LABELS[u.role]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {timeAgo(u.lastActiveAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
