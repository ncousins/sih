import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const normalised = email.toLowerCase().trim();

    // Find user — if not found, return success (no data to delete)
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalised)
      .maybeSingle();

    if (user) {
      // Cascade deletes downloads via FK — delete user record
      await supabase.from("users").delete().eq("id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Data deletion error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
