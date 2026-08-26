import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { Plate } from "@/app/components/Plate";
import { shuffle } from "@/app/lib/palettes";

// Four different paintings every time the page is asked for.
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/about", label: "The CV" },
  { href: "/painting", label: "Paintings" },
  { href: "/writing", label: "Writing" },
];

export default async function Home() {
  const paintings = await prisma.painting.findMany({
    select: { imagePath: true, title: true, medium: true, collection: true, slug: true },
  });
  const featured = shuffle(paintings).slice(0, 4);

  return (
    <div className="sheet-pad">
      <div className="home measure">
        <div>
          <p
            className="eyebrow mono bi soft"
            style={{ "--bi-lh": "1.2em", "--bi-h": "0.55em", "--bi-top": "0.1em", "--bi-tail": "34%" } as React.CSSProperties}
          >
            Staff Software Engineer · Portland, Oregon · Open to what&apos;s next
          </p>

          <h1 className="display home-display">
            <span className="hl" style={{ "--field": "var(--c-terra)" } as React.CSSProperties}>
              Everything
            </span>
            <span className="hl" style={{ "--field": "var(--c-deep)" } as React.CSSProperties}>
              good starts
            </span>
            <span className="hl" style={{ "--field": "var(--c-olive)" } as React.CSSProperties}>
              out rough.
            </span>
          </h1>

          <div
            className="lede bi soft"
            style={{ "--bi-lh": "1.62em", "--bi-h": "0.6em", "--bi-top": "0.28em", "--bi-tail": "47%" } as React.CSSProperties}
          >
            <p>
              Painters call the first pass a <em>block-in</em>: flat shapes, no
              detail, just structure and value. Engineers call it a spike, or a
              first draft, or Tuesday. I&apos;ve done both long enough to stop
              believing there&apos;s a difference between them.
            </p>
          </div>

          <ul className="home-links mono">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  {link.label}
                  <span className="arrow">&rarr;</span>
                </Link>
              </li>
            ))}
            <li>
              <a href="mailto:hello@brennaswitzer.com">
                Email<span className="arrow">&rarr;</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="home-plates">
          {featured.map((painting, i) => (
            <Plate
              key={painting.imagePath}
              imagePath={painting.imagePath}
              title={painting.title}
              meta={painting.medium ?? undefined}
              href={`/painting/${painting.collection}/${painting.slug}`}
              sizes="(max-width: 1000px) 45vw, 20vw"
              priority={i < 2}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
