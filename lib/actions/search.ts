"use server";

import { globalSearch, type SearchResult } from "@/lib/data/queries";

/** Server action backing the global search box (mode-aware). */
export async function searchAction(query: string): Promise<SearchResult[]> {
  return globalSearch(query);
}
