import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/navigation/app-shell";
import {
  getActiveOrganization,
  getNotifications,
  getUsers,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: {
    default: "CodexDominion Command Console",
    template: "%s · CodexDominion Command Console",
  },
  description:
    "The flagship AI Governance Control Plane for enterprise, healthcare, finance, and government — monitor governance, approvals, policy enforcement, compliance evidence, and vendor risk.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [users, organization, notifications] = await Promise.all([
    getUsers(),
    getActiveOrganization(),
    getNotifications(),
  ]);
  const user =
    users.find((u) => u.role === "administrator") ?? users[0];

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell
            user={user}
            organization={organization}
            notifications={notifications}
          >
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
