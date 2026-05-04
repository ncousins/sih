import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

async function createEvent(formData: FormData) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("events").insert({
    title: (formData.get("title") as string).trim(),
    description: (formData.get("description") as string)?.trim() || null,
    date: formData.get("date") as string,
    location: (formData.get("location") as string)?.trim() || null,
    is_published: formData.get("is_published") === "on",
  });
  revalidatePath("/admin/events");
}

async function toggleEventPublish(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("is_published") === "true";
  const supabase = createAdminClient();
  await supabase.from("events").update({ is_published: !current }).eq("id", id);
  revalidatePath("/admin/events");
}

async function deleteEvent(formData: FormData) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("events").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/events");
}

export default async function AdminEventsPage() {
  const supabase = createAdminClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="heading-1 mb-8">Events</h1>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-8">
        <h2 className="heading-3 mb-5">Add event</h2>
        <form action={createEvent} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-heading font-semibold text-navy">Title</label>
              <input name="title" required placeholder="GBS Skills Summit 2026"
                className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-heading font-semibold text-navy">Date & Time</label>
              <input name="date" type="datetime-local" required
                className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-heading font-semibold text-navy">Location</label>
            <input name="location" placeholder="Cape Town, South Africa"
              className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-heading font-semibold text-navy">Description</label>
            <textarea name="description" rows={3} placeholder="Event details…"
              className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-heading font-semibold text-navy">
            <input type="checkbox" name="is_published" className="w-4 h-4 accent-orange" />
            Publish immediately
          </label>
          <div>
            <button type="submit"
              className="bg-navy text-white text-sm font-heading font-semibold px-5 py-2.5 rounded hover:bg-navy/90 transition-colors cursor-pointer">
              Add event
            </button>
          </div>
        </form>
      </div>

      {/* Event list */}
      <h2 className="heading-3 mb-4">All events</h2>
      {!events || events.length === 0 ? (
        <p className="text-slate/60 text-sm">No events yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {(events as Event[]).map((ev) => (
            <div key={ev.id} className="bg-white rounded-lg border border-border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="heading-3 truncate">{ev.title}</span>
                  <span className={["text-xs font-caption px-2 py-0.5 rounded-full shrink-0",
                    ev.is_published ? "bg-green-100 text-green-700" : "bg-grey text-slate"].join(" ")}>
                    {ev.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="caption">
                  {new Date(ev.date).toLocaleDateString("en-ZA", { dateStyle: "full" })}
                  {ev.location ? ` · ${ev.location}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={toggleEventPublish}>
                  <input type="hidden" name="id" value={ev.id} />
                  <input type="hidden" name="is_published" value={String(ev.is_published)} />
                  <button type="submit"
                    className={["text-xs font-heading font-semibold px-3 py-1.5 rounded border transition-colors cursor-pointer",
                      ev.is_published
                        ? "border-slate/30 text-slate hover:bg-grey"
                        : "border-navy text-navy hover:bg-navy hover:text-white"].join(" ")}>
                    {ev.is_published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={ev.id} />
                  <button type="submit"
                    className="text-xs font-heading font-semibold px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
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
