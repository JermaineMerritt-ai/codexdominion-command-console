"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Returns null when Supabase env vars are not
 * configured (the console runs zero-config on the seed layer in that case).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export const isSupabaseEnabled = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
