import { createAdminClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export const revalidate = 60;

export default async function EventsPage() {
  const supabase = createAdminClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("date", { ascending: true });

  const now = new Date();
  const upcoming = (events as Event[] ?? []).filter((e) => new Date(e.date) >= now);
  const past = (events as Event[] ?? []).filter((e) => new Date(e.date) < now);

  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="heading-1 mb-2">Events</h1>
        <p className="text-slate leading-relaxed max-w-2xl">
          Stay connected with the GBS community — conferences, workshops, and networking events hosted by BPESA.
        </p>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-20 text-slate/50">
          <p className="text-lg">No upcoming events at this time.</p>
          <p className="text-sm mt-2">Check back soon.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="heading-2 mb-6">Upcoming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="heading-2 mb-6 text-slate">Past events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-70">
            {past.map((ev) => <EventCard key={ev.id} event={ev} past />)}
          </div>
        </section>
      )}
    </div>
  );
}

function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  const date = new Date(event.date);
  const day = date.toLocaleDateString("en-ZA", { day: "numeric" });
  const month = date.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-6 flex gap-5">
      {/* Date block */}
      <div className={["rounded-lg flex flex-col items-center justify-center w-16 h-16 shrink-0 text-white",
        past ? "bg-slate" : "bg-navy"].join(" ")}>
        <span className="text-xl font-heading font-bold leading-none">{day}</span>
        <span className="text-xs font-caption opacity-80">{month}</span>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="heading-3 leading-snug">{event.title}</h3>
        <p className="caption">
          {year} · {time}
          {event.location && <> · <span className="text-navy">{event.location}</span></>}
        </p>
        {event.description && (
          <p className="text-sm text-slate leading-relaxed mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
