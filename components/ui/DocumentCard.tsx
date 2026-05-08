import Image from "next/image";
import Link from "next/link";
import type { Document } from "@/lib/types";

function coverUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${path}`;
}

export default function DocumentCard({ doc }: { doc: Document }) {
  return (
    <Link href={`/documents/${doc.id}`} className="group block">
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden h-full flex flex-col transition-shadow group-hover:shadow-md">
        {/* Cover image — A4 portrait ratio (210:297) */}
        <div className="relative w-full bg-surface" style={{ aspectRatio: "210 / 297" }}>
          {doc.cover_image_path ? (
            <Image
              src={coverUrl(doc.cover_image_path)}
              alt={doc.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy/5 to-navy/10">
              <svg className="w-12 h-12 text-navy/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          {/* Access badge overlaid on cover */}
          <span
            className={[
              "absolute top-2 right-2 text-xs font-heading font-semibold px-2.5 py-1 rounded-full",
              doc.is_member_only
                ? "bg-navy/90 text-white"
                : doc.is_paid
                ? "bg-orange/90 text-white"
                : "bg-mint/90 text-teal",
            ].join(" ")}
          >
            {doc.is_member_only
              ? "Members"
              : doc.is_paid && doc.price != null
              ? `R${Number(doc.price).toFixed(0)}`
              : "Free"}
          </span>
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          {doc.category && (
            <span className="text-xs font-caption uppercase tracking-wide text-slate bg-surface px-2 py-0.5 rounded self-start">
              {doc.category}
            </span>
          )}
          <h3 className="heading-3 group-hover:text-orange transition-colors leading-snug">
            {doc.title}
          </h3>
          {doc.description && (
            <p className="text-sm text-slate leading-relaxed line-clamp-2 flex-1">
              {doc.description}
            </p>
          )}
          <span className="text-xs text-orange font-heading font-semibold mt-auto pt-1">
            View document →
          </span>
        </div>
      </div>
    </Link>
  );
}
