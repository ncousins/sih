import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { members } = await request.json() as {
    members: { email: string; organisation: string; tier: string }[];
  };

  if (!Array.isArray(members) || members.length === 0) {
    return NextResponse.json({ error: "No members provided" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("members")
    .upsert(members, { onConflict: "email" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: members.length });
}
