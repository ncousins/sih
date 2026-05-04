import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Document } from "@/lib/types";
import DocumentUploadForm from "@/components/ui/DocumentUploadForm";

export const dynamic = "force-dynamic";

async function togglePublish(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("is_published") === "true";
  const supabase = createAdminClient();
  await supabase
    .from("documents")
    .update({ is_published: !current })
    .eq("id", id);
  revalidatePath("/admin/documents");
}

async function deleteDocument(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const filePath = formData.get("file_path") as string;
  const supabase = createAdminClient();
  await supabase.storage.from("documents").remove([filePath]);
  await supabase.from("documents").delete().eq("id", id);
  revalidatePath("/admin/documents");
}

export default async function AdminDocumentsPage() {
  const supabase = createAdminClient();
  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-1">Documents</h1>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-10">
        <h2 className="heading-3 mb-5">Upload new document</h2>
        <DocumentUploadForm />
      </div>

      {/* Document list */}
      <h2 className="heading-3 mb-4">All documents</h2>
      {!docs || docs.length === 0 ? (
        <p className="text-slate/60 text-sm">No documents yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {(docs as Document[]).map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg border border-border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="heading-3 truncate">{doc.title}</span>
                  <span
                    className={[
                      "text-xs font-heading font-semibold px-2 py-0.5 rounded-full shrink-0",
                      doc.is_paid
                        ? "bg-orange/10 text-orange"
                        : "bg-mint/10 text-teal",
                    ].join(" ")}
                  >
                    {doc.is_paid ? `R${doc.price}` : "Free"}
                  </span>
                  <span
                    className={[
                      "text-xs font-caption px-2 py-0.5 rounded-full shrink-0",
                      doc.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-grey text-slate",
                    ].join(" ")}
                  >
                    {doc.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                {doc.category && (
                  <p className="caption">{doc.category}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <form action={togglePublish}>
                  <input type="hidden" name="id" value={doc.id} />
                  <input
                    type="hidden"
                    name="is_published"
                    value={String(doc.is_published)}
                  />
                  <button
                    type="submit"
                    className={[
                      "text-xs font-heading font-semibold px-3 py-1.5 rounded border transition-colors cursor-pointer",
                      doc.is_published
                        ? "border-slate/30 text-slate hover:bg-grey"
                        : "border-navy text-navy hover:bg-navy hover:text-white",
                    ].join(" ")}
                  >
                    {doc.is_published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deleteDocument}>
                  <input type="hidden" name="id" value={doc.id} />
                  <input type="hidden" name="file_path" value={doc.file_path} />
                  <button
                    type="submit"
                    className="text-xs font-heading font-semibold px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
