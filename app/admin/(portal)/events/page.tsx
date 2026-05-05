import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Event } from "@/lib/types";
import EventCreateForm from "@/components/ui/EventCreateForm";

export const dynamic = "force-dynamic";

function imageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
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
  const id = formData.get("id") as string;
  const imagePath = formData.get("image_path") as string;
  const supabase = createAdminClient();
  if (imagePath) await supabase.storage.from("event-images").remove([imagePath]);
  await supabase.from("events").delete().eq("id", id);
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
        <EventCreateForm />
      </div>

      {/* Event list */}
      <h2 className="heading-3 mb-4">All events</h2>
      {!events || events.length === 0 ? (
        <p className="text-slate/60 text-sm">No events yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {(events as Event[]).map((ev) => (
            <div key={ev.id} className="bg-white rounded-lg border border-border shadow-sm p-4 flex items-center gap-4">
              {/* Square thumbnail */}
              <div className="relative shrink-0 w-12 h-12 rounded overflow-hidden bg-surface border border-border">
                {ev.image_path ? (
                  <Image
                    src={imageUrl(ev.image_path)}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-navy/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
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
                <Link
                  href={`/admin/events/${ev.id}`}
                  className="text-xs font-heading font-semibold px-3 py-1.5 rounded border border-navy text-navy hover:bg-navy hover:text-white transition-colors"
                >
                  Edit
                </Link>
                <form action={toggleEventPublish}>
                  <input type="hidden" name="id" value={ev.id} />
                  <input type="hidden" name="is_published" value={String(ev.is_published)} />
                  <button type="submit"
                    className={["text-xs font-heading font-semibold px-3 py-1.5 rounded border transition-colors cursor-pointer",
                      ev.is_published
                        ? "border-slate/30 text-slate hover:bg-grey"
                        : "border-teal text-teal hover:bg-teal hover:text-white"].join(" ")}>
                    {ev.is_published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={ev.id} />
                  <input type="hidden" name="image_path" value={ev.image_path ?? ""} />
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
