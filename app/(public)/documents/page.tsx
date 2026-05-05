import { createAdminClient } from "@/lib/supabase/server";
import DocumentFilters from "@/components/ui/DocumentFilters";
import type { Document } from "@/lib/types";

export const revalidate = 60;

export default async function DocumentsPage() {
  const supabase = createAdminClient();

  const { data: docs } = await supabase
    .from("documents")
    .select("id, title, description, category, file_path, cover_image_path, is_paid, price, is_published, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="heading-1 mb-2">Documents</h1>
        <p className="text-slate leading-relaxed max-w-2xl">
          Browse our library of skills reports, research publications, and
          sector insights. Free documents require your email; premium documents
          are available to members and via purchase.
        </p>
      </div>

      <DocumentFilters docs={(docs as Document[]) ?? []} />
    </div>
  );
}
