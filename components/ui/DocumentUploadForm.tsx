"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const CATEGORIES = [
  "Research Report",
  "Skills Survey",
  "Labour Market",
  "Training & Development",
  "Policy Brief",
  "Other",
];

export default function DocumentUploadForm() {
  type AccessType = "free" | "paid" | "member";
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [accessType, setAccessType] = useState<AccessType>("free");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess(false);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Please select a PDF file.");
      setUploading(false);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      setUploading(false);
      return;
    }

    try {
      const fd = new FormData(form);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save document");

      setSuccess(true);
      formRef.current?.reset();
      setAccessType("free");
      setCoverPreview(null);

      // Refresh the page to show the new document
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="title"
          name="title"
          label="Title"
          placeholder="2024 GBS Skills Survey"
          required
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-semibold text-navy font-heading">
            Category
          </label>
          <select
            id="category"
            name="category"
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

      {/* Cover image — A4 portrait ratio (210:297) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="cover_image" className="text-sm font-semibold text-navy font-heading">
          Cover image <span className="font-normal text-slate/60">(optional)</span>
        </label>
        <div className="flex gap-4 items-start">
          {/* A4 preview */}
          <div
            className="relative shrink-0 rounded border border-border overflow-hidden bg-surface"
            style={{ width: 80, aspectRatio: "210 / 297" }}
          >
            {coverPreview ? (
              <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
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
                  return f ? URL.createObjectURL(f) : null;
                });
              }}
              className="text-sm text-slate file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-heading file:font-semibold file:bg-navy file:text-white hover:file:bg-navy/90 file:cursor-pointer transition"
            />
            <p className="text-xs text-slate/50">JPEG, PNG or WebP. Will display at A4 portrait ratio.</p>
          </div>
        </div>
      </div>

      {/* File upload */}
      <div className="flex flex-col gap-1">
        <label htmlFor="file" className="text-sm font-semibold text-navy font-heading">
          PDF file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          className="text-sm text-slate file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-heading file:font-semibold file:bg-navy file:text-white hover:file:bg-navy/90 file:cursor-pointer transition"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          Document uploaded successfully.
        </p>
      )}

      <div>
        <Button type="submit" variant="secondary" loading={uploading}>
          Upload document
        </Button>
      </div>
    </form>
  );
}
