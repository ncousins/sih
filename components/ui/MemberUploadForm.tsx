"use client";

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";

interface ParsedMember {
  email: string;
  organisation: string;
  tier: string;
}

function parseCSV(text: string): ParsedMember[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const emailIdx = headers.indexOf("email");
  const orgIdx = headers.indexOf("organisation");
  const tierIdx = headers.indexOf("tier");

  if (emailIdx === -1) throw new Error('CSV must have an "email" column.');

  return lines.slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
      const email = cols[emailIdx]?.toLowerCase();
      if (!email || !email.includes("@")) throw new Error(`Invalid email: "${cols[emailIdx]}"`);
      return {
        email,
        organisation: orgIdx >= 0 ? (cols[orgIdx] ?? "") : "",
        tier: tierIdx >= 0 ? (cols[tierIdx] ?? "standard") : "standard",
      };
    });
}

export default function MemberUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ inserted: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError("");
    setResult(null);

    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please select a CSV file."); setUploading(false); return; }

    try {
      const text = await file.text();
      const members = parseCSV(text);

      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setResult({ inserted: data.count });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        required
        className="text-sm text-slate file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-heading file:font-semibold file:bg-navy file:text-white hover:file:bg-navy/90 file:cursor-pointer"
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}
      {result && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          ✓ {result.inserted} member{result.inserted !== 1 ? "s" : ""} imported successfully.
        </p>
      )}

      <div>
        <Button type="submit" variant="secondary" loading={uploading}>
          Import members
        </Button>
      </div>
    </form>
  );
}
