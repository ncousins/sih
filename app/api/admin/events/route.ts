import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const date = formData.get("date") as string;
  const location = (formData.get("location") as string)?.trim() || null;
  const isPublished = formData.get("is_published") === "on";
  const imageFile = formData.get("image") as File | null;

  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  let imagePath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const imageName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await adminSupabase.storage
      .from("event-images")
      .upload(imageName, imageFile, { contentType: imageFile.type });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    imagePath = imageName;
  }

  const { error } = await adminSupabase.from("events").insert({
    title, description, date, location, is_published: isPublished, image_path: imagePath,
  });

  if (error) {
    if (imagePath) await adminSupabase.storage.from("event-images").remove([imagePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
