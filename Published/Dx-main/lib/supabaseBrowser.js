import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const hasSupabaseBrowserConfig = true;

export function createSupabaseBrowserClient() {
  return createClientComponentClient();
}
