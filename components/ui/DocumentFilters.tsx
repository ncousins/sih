"use client";

import { useState, useMemo } from "react";
import DocumentCard from "@/components/ui/DocumentCard";
import type { Document } from "@/lib/types";

const ALL = "All";

export default function DocumentFilters({ docs }: { docs: Document[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [access, setAccess] = useState(ALL);

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(docs.map((d) => d.category).filter(Boolean))
    ) as string[];
    return [ALL, ...cats.sort()];
  }, [docs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return docs.filter((d) => {
      const matchSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q);
      const matchCat = category === ALL || d.category === category;
      const matchAccess =
        access === ALL ||
        (access === "Free" && !d.is_paid) ||
        (access === "Paid" && d.is_paid);
      return matchSearch && matchCat && matchAccess;
    });
  }, [docs, search, category, access]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="search"
          placeholder="Search documents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-border bg-white px-4 py-2.5 text-sm text-slate placeholder:text-slate/50 outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={access}
          onChange={(e) => setAccess(e.target.value)}
          className="rounded border border-border bg-white px-3 py-2.5 text-sm text-slate outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition"
        >
          <option>All</option>
          <option>Free</option>
          <option>Paid</option>
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate/60">
          <p className="text-lg">No documents match your search.</p>
        </div>
      ) : (
        <>
          <p className="caption mb-4">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
