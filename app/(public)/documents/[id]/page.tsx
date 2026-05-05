import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import DownloadForm from "@/components/ui/DownloadForm";
import type { Document } from "@/lib/types";

export const revalidate = 60;

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!doc) notFound();

  const document = doc as Document;

  return (
    <div className="container py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="caption mb-6">
        <a href="/documents" className="hover:text-navy transition-colors">
          Documents
        </a>
        {" / "}
        <span className="text-navy">{document.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Cover image */}
          {document.cover_image_path && (
            <div
              className="relative w-full max-w-xs rounded-lg overflow-hidden border border-border shadow-sm"
              style={{ aspectRatio: "210 / 297" }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${document.cover_image_path}`}
                alt={document.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Category */}
          {document.category && (
            <span className="text-xs font-caption uppercase tracking-wide text-slate bg-surface px-2 py-0.5 rounded self-start">
              {document.category}
            </span>
          )}

          <h1 className="heading-1">{document.title}</h1>

          {document.description && (
            <p className="text-slate leading-relaxed">{document.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-slate/60 font-caption">
            <span>
              Published{" "}
              {new Date(document.created_at).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span
              className={[
                "font-semibold font-heading px-2.5 py-0.5 rounded-full text-xs",
                document.is_paid
                  ? "bg-orange/10 text-orange"
                  : "bg-mint/10 text-teal",
              ].join(" ")}
            >
              {document.is_paid && document.price != null
                ? `R${Number(document.price).toFixed(0)}`
                : "Free"}
            </span>
          </div>
        </div>

        {/* Access panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 sticky top-6">
            <h2 className="heading-3 mb-1">
              {document.is_paid ? "Access this report" : "Download free"}
            </h2>
            <p className="text-sm text-slate mb-5">
              {document.is_paid
                ? "This is a premium report. BPESA members get free access — enter your email to check."
                : "Enter your details and we'll email you a secure download link."}
            </p>

            <DownloadForm
              documentId={document.id}
              isPaid={document.is_paid}
              price={document.price}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
