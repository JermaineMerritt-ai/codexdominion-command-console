import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";
import { getActiveOrganization, getNotifications } from "@/lib/data/queries";
import { getCurrentUser, requireAuth } from "@/lib/auth/actor";
import { coerceLocale } from "@/lib/i18n/locales";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (requireAuth && !user) redirect("/login");

  const [organization, notifications, cookieStore] = await Promise.all([
    getActiveOrganization(),
    getNotifications(),
    cookies(),
  ]);
  const initialLocale = coerceLocale(cookieStore.get("codex_locale")?.value);

  return (
    <AppShell
      user={user!}
      organization={organization}
      notifications={notifications}
      authEnabled={requireAuth}
      initialLocale={initialLocale}
    >
      {children}
    </AppShell>
  );
}
