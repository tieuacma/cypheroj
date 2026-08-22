import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { DbSubmission } from "@/lib/db/types";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseKey(): string {
  const key = supabaseServiceKey ?? supabaseAnonKey;
  if (!key) {
    throw new Error(
      "Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY (recommended for server) or SUPABASE_ANON_KEY."
    );
  }
  return key;
}

let supabaseClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client singleton.
 * Prefers the service role key so API routes can insert submissions reliably.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) environment variable."
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, getSupabaseKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

export type { DbSubmission };
