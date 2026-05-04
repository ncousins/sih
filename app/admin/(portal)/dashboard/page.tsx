import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getStat(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  filter?: { column: string; value: string | boolean }
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count } = await query;
  return count ?? 0;
}

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [downloads, users, paidTx, publishedDocs, members, events] = await Promise.all([
    getStat(supabase, "downloads"),
    getStat(supabase, "users"),
    getStat(supabase, "transactions", { column: "status", value: "success" }),
    getStat(supabase, "documents", { column: "is_published", value: true }),
    getStat(supabase, "members"),
    getStat(supabase, "events", { column: "is_published", value: true }),
  ]);

  // Recent downloads
  const { data: recentDownloads } = await supabase
    .from("downloads")
    .select("created_at, payment_status, documents(title), users(name, email)")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Total downloads", value: downloads, color: "border-mint" },
    { label: "Unique users", value: users, color: "border-navy" },
    { label: "Paid transactions", value: paidTx, color: "border-orange" },
    { label: "Published documents", value: publishedDocs, color: "border-teal" },
    { label: "Members", value: members, color: "border-slate" },
    { label: "Published events", value: events, color: "border-mint" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="heading-1 mb-8">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label}
            className={`bg-white rounded-xl border-l-4 ${s.color} border border-border shadow-sm p-5`}>
            <p className="caption mb-1">{s.label}</p>
            <p className="font-heading font-bold text-3xl text-navy">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <h2 className="heading-3 mb-4">Recent downloads</h2>
      {!recentDownloads || recentDownloads.length === 0 ? (
        <p className="text-slate/60 text-sm">No downloads yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {["User", "Document", "Type", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-heading font-semibold text-navy text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDownloads.map((d, i) => {
                const user = (d.users as unknown) as { name: string; email: string } | null;
                const doc = (d.documents as unknown) as { title: string } | null;
                return (
                  <tr key={i} className={i % 2 === 0 ? "" : "bg-surface/50"}>
                    <td className="px-4 py-3 text-slate">
                      <p className="font-semibold text-navy text-xs">{user?.name ?? "—"}</p>
                      <p className="text-xs text-slate/60">{user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate truncate max-w-[180px]">{doc?.title ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={["text-xs font-heading font-semibold px-2 py-0.5 rounded-full",
                        d.payment_status === "paid"
                          ? "bg-orange/10 text-orange"
                          : "bg-mint/10 text-teal"].join(" ")}>
                        {d.payment_status === "paid" ? "Paid" : "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate/60 text-xs">
                      {new Date(d.created_at).toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
