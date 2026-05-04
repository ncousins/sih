import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendDownloadEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { name, email, documentId } = await request.json();

    if (!name || !email || !documentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch document
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, title, file_path, is_paid, is_published")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!doc.is_published) {
      return NextResponse.json({ error: "Document not available" }, { status: 403 });
    }

    if (doc.is_paid) {
      // Check if email is a member (members get free access)
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (!member) {
        return NextResponse.json({ error: "Payment required" }, { status: 402 });
      }
    }

    // Upsert user record
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        { name: name.trim(), email: email.toLowerCase().trim() },
        { onConflict: "email", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
    }

    // Record download
    await supabase.from("downloads").insert({
      user_id: user.id,
      document_id: doc.id,
      payment_status: "free",
    });

    // Generate 24-hour signed URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60 * 60 * 24);

    if (signedError || !signedData) {
      return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
    }

    // Send email
    await sendDownloadEmail({
      to: email.toLowerCase().trim(),
      name: name.trim(),
      documentTitle: doc.title,
      downloadUrl: signedData.signedUrl,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Download route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
