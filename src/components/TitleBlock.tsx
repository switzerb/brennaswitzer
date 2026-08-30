"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/about", label: "CV" },
  { href: "/painting", label: "Plates" },
  { href: "/writing", label: "Writing" },
];

/* The title block off an engineering drawing: who drew it, what it is,
   where, and the sheet you are looking at. */
export function TitleBlock() {
  const pathname = usePathname();

  return (
    <div className="titleblock mono">
      <Link href="/" className="tb-cell tb-name">
        Brenna&nbsp;Switzer
      </Link>
      <div className="tb-cell max-md:hidden">Staff Software Engineer</div>
      <div className="tb-cell max-lg:hidden">Portland, OR</div>
      <nav className="tb-cell tb-nav">
        {LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
