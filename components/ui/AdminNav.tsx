"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/admin/documents", label: "Documents", icon: "📄" },
  { href: "/admin/events", label: "Events", icon: "📅" },
  { href: "/admin/members", label: "Members", icon: "👥" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-navy text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/10">
        <p className="font-heading font-bold text-base tracking-wide">
          BPESA<span className="text-orange"> Admin</span>
        </p>
        <p className="caption text-white/40 mt-0.5">Skills Intelligence Hub</p>
      </div>

      <nav className="flex-1 p-4 pb-16 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-heading font-medium transition-colors",
                active
                  ? "bg-orange text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-white/10">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-heading font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <span aria-hidden>↩</span>
              Sign out
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
