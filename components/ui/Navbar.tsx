"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/documents", label: "Documents" },
  { href: "/events", label: "Events" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-navy text-white shadow-md">
      <div className="container flex items-center justify-between h-16">
        {/* Logo / Wordmark */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="font-heading font-bold text-lg tracking-wide leading-tight">
            BPESA<span className="text-orange"> SIH</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-heading font-medium text-white/80 hover:text-orange transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded hover:bg-white/10 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t border-white/10 bg-navy">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-heading font-medium text-white/80 hover:text-orange transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
