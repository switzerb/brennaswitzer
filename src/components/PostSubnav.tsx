import Link from "next/link";
import { POST_SERIES } from "@/app/lib/postSeries";

export function PostSubnav({ active }: { active?: string }) {
  return (
    <nav className="subnav mono">
      <Link href="/writing" aria-current={!active ? "page" : undefined}>
        All
      </Link>
      {POST_SERIES.map((s) => (
        <Link
          key={s.slug}
          href={`/writing/series/${s.slug}`}
          aria-current={active === s.slug ? "page" : undefined}
        >
          {s.title}
        </Link>
      ))}
    </nav>
  );
}
