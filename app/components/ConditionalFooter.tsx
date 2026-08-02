"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

// The homepage is a fixed, one-screen layout (intro + nav columns, no
// scroll) — a footer below it would push the page past 100dvh.
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Footer />;
}
