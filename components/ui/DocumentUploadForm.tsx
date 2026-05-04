"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
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
      // 1. Upload file to Supabase Storage
      const supabase = createClient();
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, { contentType: "application/pdf" });

      if (uploadError) throw new Error(uploadError.message);

      // 2. Save metadata via server action
      const fd = new FormData(form);
      fd.set("file_path", fileName);
      fd.delete("file");

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save document");

      setSuccess(true);
      formRef.current?.reset();
      setIsPaid(false);

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

      {/* Pricing */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="is_paid"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="w-4 h-4 accent-orange"
          />
          <span className="text-sm font-heading font-semibold text-navy">
            Paid document
          </span>
        </label>
        {isPaid && (
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
