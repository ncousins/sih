import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack";
import { sendDownloadEmail } from "@/lib/resend";
import Button from "@/components/ui/Button";

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; document_id?: string; trxref?: string }>;
}) {
  const { reference, document_id, trxref } = await searchParams;
  const ref = reference ?? trxref;

  if (!ref) redirect("/documents");

  let success = false;
  let documentTitle = "";
  let errorMessage = "";

  try {
    const tx = await verifyTransaction(ref);

    if (tx.status !== "success") {
      errorMessage = "Payment was not completed. Please try again.";
    } else {
      const supabase = createAdminClient();
      const docId = document_id ?? tx.metadata?.document_id;

      if (!docId) throw new Error("Missing document reference");

      // Fetch document
      const { data: doc } = await supabase
        .from("documents")
        .select("id, title, file_path, price")
        .eq("id", docId)
        .single();

      if (!doc) throw new Error("Document not found");
      documentTitle = doc.title;

      // Fetch user by email
      const email = tx.customer.email;
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (!user) throw new Error("User record not found");

      // Idempotent — only insert if this reference hasn't been processed
      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("paystack_ref", ref)
        .maybeSingle();

      if (!existing) {
        await supabase.from("transactions").insert({
          user_id: user.id,
          document_id: doc.id,
          amount: doc.price,
          currency: "ZAR",
          paystack_ref: ref,
          status: "success",
        });

        await supabase.from("downloads").insert({
          user_id: user.id,
          document_id: doc.id,
          payment_status: "paid",
        });

        // Generate signed URL and send email
        const { data: signed } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.file_path, 60 * 60 * 24);

        if (signed?.signedUrl) {
          const name = tx.metadata?.name ?? email;
          await sendDownloadEmail({
            to: email,
            name,
            documentTitle: doc.title,
            downloadUrl: signed.signedUrl,
          });
        }
      }

      success = true;
    }
  } catch (err) {
    console.error("Payment callback error:", err);
    errorMessage = "Something went wrong verifying your payment. Please contact support.";
  }

  if (success) {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center">
        <div className="bg-white rounded-xl border border-border shadow-sm p-10">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="heading-2 mb-2">Payment successful</h1>
          <p className="text-slate mb-2">
            Thank you for your purchase of{" "}
            <span className="font-semibold text-navy">{documentTitle}</span>.
          </p>
          <p className="text-sm text-slate mb-8">
            Check your email — we&apos;ve sent a secure download link that expires in 24 hours.
          </p>
          <Link href="/documents">
            <Button variant="secondary">Browse more documents</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-20 max-w-lg mx-auto text-center">
      <div className="bg-white rounded-xl border border-border shadow-sm p-10">
        <p className="text-4xl mb-4">❌</p>
        <h1 className="heading-2 mb-2">Payment issue</h1>
        <p className="text-sm text-slate mb-8">{errorMessage}</p>
        <Link href="/documents">
          <Button variant="ghost">Back to documents</Button>
        </Link>
      </div>
    </div>
  );
}
