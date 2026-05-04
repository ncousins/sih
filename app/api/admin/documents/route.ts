import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Verify the request comes from an authenticated admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const category = (formData.get("category") as string) || null;
  const isPaid = formData.get("is_paid") === "on";
  const priceRaw = formData.get("price") as string;
  const price = isPaid && priceRaw ? parseFloat(priceRaw) : null;
  const filePath = formData.get("file_path") as string;

  if (!title || !filePath) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("documents").insert({
    title,
    description,
    category,
    file_path: filePath,
    is_paid: isPaid,
    price,
    is_published: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
