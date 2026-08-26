import Link from "next/link";
import { PAINTING_COLLECTIONS } from "@/app/lib/paintingCollections";

export function PaintingSubnav({ active }: { active?: string }) {
  return (
    <nav className="subnav mono">
      <Link href="/painting" aria-current={!active ? "page" : undefined}>
        All plates
      </Link>
      {PAINTING_COLLECTIONS.map((c) => (
        <Link
          key={c.slug}
          href={`/painting/${c.slug}`}
          aria-current={active === c.slug ? "page" : undefined}
        >
          {c.title}
        </Link>
      ))}
    </nav>
  );
}
