import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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
  const isMemberOnly = formData.get("is_member_only") === "on";
  const priceRaw = formData.get("price") as string;
  const price = isPaid && priceRaw ? parseFloat(priceRaw) : null;
  const file = formData.get("file") as File | null;
  const coverImage = formData.get("cover_image") as File | null;

  if (!title || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error: uploadError } = await adminSupabase.storage
    .from("documents")
    .upload(fileName, file, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  let coverImagePath: string | null = null;
  if (coverImage && coverImage.size > 0) {
    const coverName = `${Date.now()}-${coverImage.name.replace(/\s+/g, "-")}`;
    const { error: coverError } = await adminSupabase.storage
      .from("covers")
      .upload(coverName, coverImage, { contentType: coverImage.type });

    if (coverError) {
      await adminSupabase.storage.from("documents").remove([fileName]);
      return NextResponse.json({ error: coverError.message }, { status: 500 });
    }
    coverImagePath = coverName;
  }

  const { error } = await adminSupabase.from("documents").insert({
    title,
    description,
    category,
    file_path: fileName,
    cover_image_path: coverImagePath,
    is_paid: isPaid,
    is_member_only: isMemberOnly,
    price,
    is_published: false,
  });

  if (error) {
    await adminSupabase.storage.from("documents").remove([fileName]);
    if (coverImagePath) await adminSupabase.storage.from("covers").remove([coverImagePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
