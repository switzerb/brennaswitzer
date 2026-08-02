import Link from "next/link";
import { PAINTING_COLLECTIONS } from "@/app/lib/paintingCollections";

export function PaintingSubnav({ active }: { active?: string }) {
  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-2 mb-12 text-sm">
      {PAINTING_COLLECTIONS.map((c) => (
        <Link
          key={c.slug}
          href={`/painting/${c.slug}`}
          className={`transition-colors hover:text-accent ${
            active === c.slug
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {c.title}
        </Link>
      ))}
    </nav>
  );
}
