"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Sign out of the Supabase session and return to the login screen. */
export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
