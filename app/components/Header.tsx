"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/painting", label: "Painting" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  // The homepage is a fixed, one-screen layout with its own nav (the three
  // columns) — a header here would both eat into that fixed height and be
  // redundant.
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg tracking-tight">
          Brenna Switzer
        </Link>
        <nav className="flex gap-8 text-sm">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-accent ${
                  active
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
