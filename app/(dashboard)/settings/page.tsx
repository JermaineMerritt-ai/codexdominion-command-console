"use client";
import { useState } from "react";
import { Building2, Shield, Plug, Users } from "lucide-react";
import { Header } from "@/components/navigation/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const integrations = [
  {
    id: "supabase",
    name: "Supabase",
    description: "Database and authentication provider",
    status: "connected",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Issue tracking and workflow management",
    status: "disconnected",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Notifications and governance alerts",
    status: "connected",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Policy-as-code version control",
    status: "disconnected",
  },
  {
    id: "splunk",
    name: "Splunk",
    description: "Security information and event management",
    status: "disconnected",
  },
];

const users = [
  { id: "1", name: "Dr. Sarah Chen", email: "s.chen@org.gov", role: "Admin", status: "active" },
  { id: "2", name: "James Okafor", email: "j.okafor@org.gov", role: "Reviewer", status: "active" },
  { id: "3", name: "Amara Osei", email: "a.osei@org.gov", role: "Reviewer", status: "active" },
  { id: "4", name: "Marcus Webb", email: "m.webb@org.gov", role: "Viewer", status: "inactive" },
];

const policies = [
  { framework: "HIPAA", version: "2024.3", enabled: true, lastUpdated: "Nov 15, 2024" },
  { framework: "FedRAMP Moderate", version: "Rev 5", enabled: true, lastUpdated: "Nov 10, 2024" },
  { framework: "SOC 2 Type II", version: "2024", enabled: true, lastUpdated: "Oct 28, 2024" },
  { framework: "NIST SP 800-53", version: "Rev 5", enabled: true, lastUpdated: "Oct 15, 2024" },
  { framework: "CMMC Level 2", version: "v2.0", enabled: false, lastUpdated: "Sep 30, 2024" },
  { framework: "ISO 27001", version: "2022", enabled: true, lastUpdated: "Oct 22, 2024" },
];

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("Acme Federal Services LLC");
  const [orgId, setOrgId] = useState("ORG-2024-AF-001");

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header title="Settings" subtitle="Organization configuration and system preferences" />
      <div className="flex-1 p-6">
        <Tabs defaultValue="organization">
          <TabsList className="mb-6">
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" /> Organization
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <Shield className="h-4 w-4" /> Policies
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Plug className="h-4 w-4" /> Integrations
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Configure your organization profile and compliance metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-id">Organization ID</Label>
                    <Input
                      id="org-id"
                      value={orgId}
                      onChange={(e) => setOrgId(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry Sector</Label>
                    <Input id="industry" defaultValue="Federal Contractor — Healthcare IT" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cage">CAGE Code</Label>
                    <Input id="cage" defaultValue="7QR42" className="font-mono" />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Frameworks</CardTitle>
                <CardDescription>
                  Manage the regulatory frameworks enforced by CodexDominion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {policies.map((p) => (
                    <li key={p.framework} className="flex items-center justify-between rounded-md border px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{p.framework}</p>
                        <p className="text-xs text-muted-foreground">
                          Version {p.version} · Last updated {p.lastUpdated}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.enabled ? "success" : "neutral"} className="text-xs">
                          {p.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          {p.enabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>System Integrations</CardTitle>
                <CardDescription>
                  Connect CodexDominion to your existing compliance toolchain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {integrations.map((int) => (
                    <li key={int.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{int.name}</p>
                        <p className="text-xs text-muted-foreground">{int.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={int.status === "connected" ? "success" : "neutral"}
                          className="text-xs"
                        >
                          {int.status === "connected" ? "Connected" : "Disconnected"}
                        </Badge>
                        <Button
                          variant={int.status === "connected" ? "outline" : "default"}
                          size="sm"
                          className="h-7 text-xs"
                        >
                          {int.status === "connected" ? "Configure" : "Connect"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription className="mt-1">
                    Manage access control and reviewer assignments.
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Users className="h-4 w-4" /> Invite User
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="info" className="text-xs">
                          {user.role}
                        </Badge>
                        <Badge
                          variant={user.status === "active" ? "success" : "neutral"}
                          className="text-xs"
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Edit
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
