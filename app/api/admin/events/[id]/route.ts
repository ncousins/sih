import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const formData = await request.formData();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const date = formData.get("date") as string;
  const location = (formData.get("location") as string)?.trim() || null;
  const isPublished = formData.get("is_published") === "on";
  const newImage = formData.get("image") as File | null;
  const currentImagePath = (formData.get("current_image_path") as string) || null;

  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const updates: Record<string, unknown> = { title, description, date, location, is_published: isPublished };

  if (newImage && newImage.size > 0) {
    const imageName = `${Date.now()}-${newImage.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await adminSupabase.storage
      .from("event-images")
      .upload(imageName, newImage, { contentType: newImage.type });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    if (currentImagePath) await adminSupabase.storage.from("event-images").remove([currentImagePath]);
    updates.image_path = imageName;
  }

  const { error } = await adminSupabase.from("events").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
