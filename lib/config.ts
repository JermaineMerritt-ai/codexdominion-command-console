// ─────────────────────────────────────────────────────────────
// Runtime configuration & data-source mode switch.
//
//   NEXT_PUBLIC_APP_MODE = "demo"     → typed seed data (default)
//   NEXT_PUBLIC_APP_MODE = "database" → Prisma / Supabase
//
// Demo is ALWAYS the default so a credential-free Vercel preview
// (and local dev) never breaks for buyer demonstrations.
// ─────────────────────────────────────────────────────────────

export type AppMode = "demo" | "database";

export const APP_MODE: AppMode =
  process.env.NEXT_PUBLIC_APP_MODE === "database" ? "database" : "demo";

export const isDatabaseMode = APP_MODE === "database";
export const isDemoMode = APP_MODE === "demo";

/** Human-readable label for the current data source (shown in the UI). */
export const dataSourceLabel = isDatabaseMode ? "Live Database" : "Demo Data";
