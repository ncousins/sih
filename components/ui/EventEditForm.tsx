"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Event } from "@/lib/types";

function imageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-images/${path}`;
}

function toDatetimeLocal(iso: string) {
  // Converts ISO date string to the format required by datetime-local input
  return iso.slice(0, 16);
}

interface Props {
  event: Event;
}

export default function EventEditForm({ event: ev }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(
    ev.image_path ? imageUrl(ev.image_path) : null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch(`/api/admin/events/${ev.id}`, { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save changes");

      router.push("/admin/events");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="current_image_path" value={ev.image_path ?? ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-heading font-semibold text-navy">Title</label>
          <input
            name="title"
            required
            defaultValue={ev.title}
            className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-heading font-semibold text-navy">Date & Time</label>
          <input
            name="date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(ev.date)}
            className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-heading font-semibold text-navy">Location</label>
        <input
          name="location"
          defaultValue={ev.location ?? ""}
          placeholder="Cape Town, South Africa"
          className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-heading font-semibold text-navy">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={ev.description ?? ""}
          placeholder="Event details…"
          className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition resize-none"
        />
      </div>

      {/* Square image */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-heading font-semibold text-navy">
          Event image <span className="font-normal text-slate/60">(leave blank to keep current)</span>
        </label>
        <div className="flex gap-4 items-start">
          <div className="relative shrink-0 rounded border border-border overflow-hidden bg-surface w-16 h-16">
            {imagePreview ? (
              <Image src={imagePreview} alt="Image preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-navy/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 pt-1">
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setImagePreview((prev) => {
                  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                  return f ? URL.createObjectURL(f) : (ev.image_path ? imageUrl(ev.image_path) : null);
                });
              }}
              className="text-sm text-slate file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-heading file:font-semibold file:bg-navy file:text-white hover:file:bg-navy/90 file:cursor-pointer transition"
            />
            <p className="text-xs text-slate/50">JPEG, PNG or WebP. Displays as a square.</p>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-heading font-semibold text-navy">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={ev.is_published}
          className="w-4 h-4 accent-orange"
        />
        Published
      </label>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange text-white text-sm font-heading font-semibold px-5 py-2.5 rounded hover:bg-orange/90 transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="text-sm font-heading font-semibold px-5 py-2.5 rounded border border-border text-slate hover:bg-grey transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
