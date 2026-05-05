import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { name, email, organisation, documentId } = await request.json();

    if (!name || !email || !organisation || !documentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch document to get price and title
    const { data: doc } = await supabase
      .from("documents")
      .select("id, title, price, is_paid, is_published")
      .eq("id", documentId)
      .eq("is_published", true)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!doc.is_paid || !doc.price) {
      return NextResponse.json({ error: "Document is not a paid document" }, { status: 400 });
    }

    // Upsert user so we have a record before payment completes
    await supabase
      .from("users")
      .upsert(
        { name: name.trim(), email: email.toLowerCase().trim(), organisation: organisation.trim() },
        { onConflict: "email", ignoreDuplicates: false }
      );

    const reference = `sih-${randomUUID()}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/callback?reference=${reference}&document_id=${documentId}`;

    const { authorizationUrl } = await initializeTransaction({
      email: email.toLowerCase().trim(),
      amountZAR: Number(doc.price),
      reference,
      callbackUrl,
      metadata: {
        name: name.trim(),
        documentId: doc.id,
        documentTitle: doc.title,
      },
    });

    return NextResponse.json({ authorizationUrl });
  } catch (err) {
    console.error("Paystack initialize error:", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
