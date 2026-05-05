import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import EventEditForm from "@/components/ui/EventEditForm";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/events" className="text-sm font-heading font-semibold text-slate hover:text-navy transition-colors">
          ← Events
        </Link>
        <span className="text-slate/30">/</span>
        <span className="text-sm font-heading font-semibold text-navy">Edit</span>
      </div>

      <h1 className="heading-1 mb-8">Edit event</h1>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <EventEditForm event={data as Event} />
      </div>
    </div>
  );
}
