import Link from "next/link";
import { POST_SERIES } from "@/app/lib/postSeries";

export function PostSubnav({ active }: { active?: string }) {
  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-2 mb-12 text-sm">
      <Link
        href="/writing"
        className={`transition-colors hover:text-accent ${
          !active
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        All
      </Link>
      {POST_SERIES.map((s) => (
        <Link
          key={s.slug}
          href={`/writing/series/${s.slug}`}
          className={`transition-colors hover:text-accent ${
            active === s.slug
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {s.title}
        </Link>
      ))}
    </nav>
  );
}