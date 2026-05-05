import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyWebhookSignature, verifyTransaction } from "@/lib/paystack";
import { sendDownloadEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event: string; data: { reference: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = payload.data.reference;

  try {
    const supabase = createAdminClient();

    // Idempotency — skip if already processed
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("paystack_ref", reference)
      .maybeSingle();

    if (existing) return NextResponse.json({ received: true });

    // Verify with Paystack to get authoritative data
    const tx = await verifyTransaction(reference);
    if (tx.status !== "success") return NextResponse.json({ received: true });

    const email = tx.customer.email;
    const docId = tx.metadata?.document_id;
    const name = tx.metadata?.name ?? email;

    if (!docId) {
      console.error("Webhook: missing document_id in metadata", reference);
      return NextResponse.json({ received: true });
    }

    const { data: doc } = await supabase
      .from("documents")
      .select("id, title, file_path, price")
      .eq("id", docId)
      .single();

    if (!doc) return NextResponse.json({ received: true });

    // Upsert user
    const { data: user } = await supabase
      .from("users")
      .upsert(
        { name, email },
        { onConflict: "email", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (!user) return NextResponse.json({ received: true });

    await supabase.from("transactions").insert({
      user_id: user.id,
      document_id: doc.id,
      amount: doc.price,
      currency: "ZAR",
      paystack_ref: reference,
      status: "success",
    });

    await supabase.from("downloads").insert({
      user_id: user.id,
      document_id: doc.id,
      payment_status: "paid",
    });

    const { data: signed } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60 * 60 * 24);

    if (signed?.signedUrl) {
      await sendDownloadEmail({
        to: email,
        name,
        documentTitle: doc.title,
        downloadUrl: signed.signedUrl,
      });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Return 200 so Paystack doesn't retry — errors are logged
  }

  return NextResponse.json({ received: true });
}
