import { createAdminClient } from "@/lib/supabase/server";
import MemberUploadForm from "@/components/ui/MemberUploadForm";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  const { data: recent } = await supabase
    .from("members")
    .select("email, organisation, tier, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-1">Members</h1>
          <p className="caption mt-1">{count ?? 0} total members</p>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-8">
        <h2 className="heading-3 mb-2">Upload member CSV</h2>
        <p className="text-sm text-slate mb-5">
          CSV must have columns: <code className="bg-surface px-1 rounded text-xs">email</code>,{" "}
          <code className="bg-surface px-1 rounded text-xs">organisation</code>,{" "}
          <code className="bg-surface px-1 rounded text-xs">tier</code>. Existing members are updated.
        </p>
        <MemberUploadForm />
      </div>

      {/* Recent members */}
      {recent && recent.length > 0 && (
        <div>
          <h2 className="heading-3 mb-4">Recent members</h2>
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-3 font-heading font-semibold text-navy text-xs uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 font-heading font-semibold text-navy text-xs uppercase tracking-wide">Organisation</th>
                  <th className="text-left px-4 py-3 font-heading font-semibold text-navy text-xs uppercase tracking-wide">Tier</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m, i) => (
                  <tr key={m.email} className={i % 2 === 0 ? "" : "bg-surface/50"}>
                    <td className="px-4 py-3 text-slate">{m.email}</td>
                    <td className="px-4 py-3 text-slate">{m.organisation ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-slate">{m.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
