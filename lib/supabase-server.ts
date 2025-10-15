import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Server-side Supabase client with service role key
// This bypasses RLS and has full privileges - MUST only be used in API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
};
