import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-caption">
        <p>
          &copy; {year}{" "}
          <span className="text-white font-semibold">BPESA</span>. All rights
          reserved.
        </p>
        <div className="flex items-center gap-6">
          <p className="text-white/40 text-xs">
            Skills Intelligence Hub — Powered by BPESA
          </p>
          <Link
            href="/admin/login"
            className="text-white/20 text-xs hover:text-white/50 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
