import Link from "next/link";
import type { Document } from "@/lib/types";

export default function DocumentCard({ doc }: { doc: Document }) {
  return (
    <Link href={`/documents/${doc.id}`} className="group block">
      <div className="bg-white rounded-lg border border-border shadow-sm p-6 h-full flex flex-col gap-3 transition-shadow group-hover:shadow-md">
        {/* Category + price badge */}
        <div className="flex items-center justify-between gap-2">
          {doc.category && (
            <span className="text-xs font-caption uppercase tracking-wide text-slate bg-surface px-2 py-0.5 rounded">
              {doc.category}
            </span>
          )}
          <span
            className={[
              "ml-auto text-xs font-heading font-semibold px-2.5 py-1 rounded-full shrink-0",
              doc.is_paid
                ? "bg-orange/10 text-orange"
                : "bg-mint/10 text-teal",
            ].join(" ")}
          >
            {doc.is_paid && doc.price != null
              ? `R${Number(doc.price).toFixed(0)}`
              : "Free"}
          </span>
        </div>

        {/* Title */}
        <h3 className="heading-3 group-hover:text-orange transition-colors leading-snug">
          {doc.title}
        </h3>

        {/* Description */}
        {doc.description && (
          <p className="text-sm text-slate leading-relaxed line-clamp-3 flex-1">
            {doc.description}
          </p>
        )}

        <span className="text-xs text-orange font-heading font-semibold mt-auto">
          View document →
        </span>
      </div>
    </Link>
  );
}
