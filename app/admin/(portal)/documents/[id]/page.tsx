import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import DocumentEditForm from "@/components/ui/DocumentEditForm";
import type { Document } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const doc = data as Document;

  const { data: signed } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 60 * 60);

  const coverPublicUrl = doc.cover_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${doc.cover_image_path}`
    : null;

  return (
    <div className="max-w-2xl">
      <nav className="caption mb-6">
        <Link href="/admin/documents" className="hover:text-navy transition-colors">
          Documents
        </Link>
        {" / "}
        <span className="text-navy">Edit</span>
      </nav>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="heading-1">Edit document</h1>
        <span
          className={[
            "text-xs font-caption px-2 py-0.5 rounded-full",
            doc.is_published ? "bg-green-100 text-green-700" : "bg-grey text-slate",
          ].join(" ")}
        >
          {doc.is_published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <DocumentEditForm
          document={doc}
          pdfSignedUrl={signed?.signedUrl ?? "#"}
          coverPublicUrl={coverPublicUrl}
        />
      </div>
    </div>
  );
}
