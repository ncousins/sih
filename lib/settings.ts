import { createAdminClient } from "@/lib/supabase/server";

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const { data } = await createAdminClient()
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? fallback;
}
