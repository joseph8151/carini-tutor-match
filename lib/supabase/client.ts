"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const browserSupabaseConfigured = Boolean(url && anonKey);

export function createBrowserSupabase() {
  if (!browserSupabaseConfigured) return null;
  return createBrowserClient(url as string, anonKey as string);
}
