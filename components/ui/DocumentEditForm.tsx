"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Document } from "@/lib/types";

const CATEGORIES = [
  "Research Report",
  "Skills Survey",
  "Labour Market",
  "Training & Development",
  "Policy Brief",
  "Other",
];

interface Props {
  document: Document;
  pdfSignedUrl: string;
  coverPublicUrl: string | null;
}

export default function DocumentEditForm({ document: doc, pdfSignedUrl, coverPublicUrl }: Props) {
  const router = useRouter();
  type AccessType = "free" | "paid" | "member";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [accessType, setAccessType] = useState<AccessType>(
    doc.is_member_only ? "member" : doc.is_paid ? "paid" : "free"
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(coverPublicUrl);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const newFile = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];

    if (newFile && newFile.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData(form);

      const res = await fetch(`/api/admin/documents/${doc.id}`, {
        method: "PATCH",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save changes");

      router.push("/admin/documents");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Hidden fields for current file paths so the API can clean up old files */}
      <input type="hidden" name="current_file_path" value={doc.file_path} />
      <input type="hidden" name="current_cover_path" value={doc.cover_image_path ?? ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="title"
          name="title"
          label="Title"
          defaultValue={doc.title}
          required
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-semibold text-navy font-heading">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={doc.category ?? ""}
            className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-semibold text-navy font-heading">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={doc.description ?? ""}
          placeholder="Brief description of this document…"
          className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate placeholder:text-slate/50 outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition resize-none"
        />
      </div>

      {/* Hidden access type fields */}
      <input type="hidden" name="is_paid" value={accessType === "paid" ? "on" : ""} />
      <input type="hidden" name="is_member_only" value={accessType === "member" ? "on" : ""} />

      {/* Access type */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-heading font-semibold text-navy">Access type</span>
        <div className="flex flex-wrap gap-3">
          {(["free", "paid", "member"] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="access_type_ui"
                value={type}
                checked={accessType === type}
                onChange={() => setAccessType(type)}
                className="accent-orange"
              />
              <span className="text-sm font-heading font-medium text-navy">
                {type === "free" ? "Free" : type === "paid" ? "Paid" : "Members only"}
              </span>
            </label>
          ))}
        </div>
        {accessType === "paid" && (
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={doc.price ?? ""}
            placeholder="Price (ZAR)"
            className="w-36"
          />
        )}
        {accessType === "member" && (
          <p className="text-xs text-slate/60">
            Access is granted when the requester&apos;s email domain matches any member organisation on the members list.
          </p>
        )}
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label htmlFor="cover_image" className="text-sm font-semibold text-navy font-heading">
          Cover image <span className="font-normal text-slate/60">(leave blank to keep current)</span>
        </label>
        <div className="flex gap-4 items-start">
          <div
            className="relative shrink-0 rounded border border-border overflow-hidden bg-surface"
            style={{ width: 80, aspectRatio: "210 / 297" }}
          >
            {coverPreview ? (
              <Image src={coverPreview} alt="Cover preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-navy/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 pt-1">
            <input
              id="cover_image"
              name="cover_image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setCoverPreview((prev) => {
                  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                  return f ? URL.createObjectURL(f) : coverPublicUrl;
                });
              }}
              className="text-sm text-slate file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-heading file:font-semibold file:bg-navy file:text-white hover:file:bg-navy/90 file:cursor-pointer transition"
            />
            <p className="text-xs text-slate/50">JPEG, PNG or WebP. Displays at A4 portrait ratio.</p>
          </div>
        </div>
      </div>

      {/* PDF replacement */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-semibold text-navy font-heading">
          PDF file
        </label>
        {/* Current file indicator */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded px-3 py-2">
          <svg className="w-4 h-4 text-slate/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-xs text-slate truncate flex-1">
            {doc.file_path.replace(/^\d+-/, "")}
          </span>
          <a
            href={pdfSignedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-navy font-heading font-semibold hover:text-orange transition-colors shrink-0"
          >
            Open →
          </a>
        </div>
        <label className="text-xs text-slate/60 font-heading font-medium mt-0.5">
          Replace with a new file (optional)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          className="text-sm text-slate file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-heading file:font-semibold file:bg-navy file:text-white hover:file:bg-navy/90 file:cursor-pointer transition"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" variant="secondary" loading={saving}>
          Save changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/documents")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
