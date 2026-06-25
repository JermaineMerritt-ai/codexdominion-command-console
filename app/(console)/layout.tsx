import { redirect } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";
import { getActiveOrganization, getNotifications } from "@/lib/data/queries";
import { getCurrentUser, requireAuth } from "@/lib/auth/actor";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (requireAuth && !user) redirect("/login");

  const [organization, notifications] = await Promise.all([
    getActiveOrganization(),
    getNotifications(),
  ]);

  return (
    <AppShell
      user={user!}
      organization={organization}
      notifications={notifications}
      authEnabled={requireAuth}
    >
      {children}
    </AppShell>
  );
}
