import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const category = (formData.get("category") as string) || null;
  const isPaid = formData.get("is_paid") === "on";
  const isMemberOnly = formData.get("is_member_only") === "on";
  const priceRaw = formData.get("price") as string;
  const price = isPaid && priceRaw ? parseFloat(priceRaw) : null;
  const newFile = formData.get("file") as File | null;
  const newCover = formData.get("cover_image") as File | null;
  const currentFilePath = formData.get("current_file_path") as string;
  const currentCoverPath = formData.get("current_cover_path") as string | null;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const updates: Record<string, unknown> = { title, description, category, is_paid: isPaid, is_member_only: isMemberOnly, price };

  let newFileName: string | null = null;

  // Replace PDF if a new one was provided
  if (newFile && newFile.size > 0) {
    newFileName = `${Date.now()}-${newFile.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await adminSupabase.storage
      .from("documents")
      .upload(newFileName, newFile, { contentType: "application/pdf" });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    await adminSupabase.storage.from("documents").remove([currentFilePath]);
    updates.file_path = newFileName;
  }

  // Replace cover image if a new one was provided
  if (newCover && newCover.size > 0) {
    const coverName = `${Date.now()}-${newCover.name.replace(/\s+/g, "-")}`;
    const { error: coverError } = await adminSupabase.storage
      .from("covers")
      .upload(coverName, newCover, { contentType: newCover.type });

    if (coverError) {
      // Roll back the PDF upload if it happened in this same request
      if (newFileName) await adminSupabase.storage.from("documents").remove([newFileName]);
      return NextResponse.json({ error: coverError.message }, { status: 500 });
    }
    if (currentCoverPath) {
      await adminSupabase.storage.from("covers").remove([currentCoverPath]);
    }
    updates.cover_image_path = coverName;
  }

  const { error } = await adminSupabase
    .from("documents")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
