import Link from "next/link";
import Image from "next/image";

interface Section {
  href: string;
  label: string;
  image?: string;
}

const SECTIONS: Section[] = [
  { href: "/painting", label: "Painting" },
  { href: "/writing", label: "Writing", image: "/assets/background.jpg" },
  { href: "/about", label: "About", image: "/assets/me.jpg" },
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function textColorFor(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? "#1a1a1a" : "#f5f5f4";
}

export function HomeNav({
  colors,
  images,
}: {
  colors: [string, string, string];
  images: string[];
}) {
  return (
    <div className="flex flex-row w-full h-full">
      {SECTIONS.map((section, i) => {
        const randomPic = images[i];

        const image = section.image ? section.image : randomPic;

        return (
          <Link
            key={section.href}
            href={section.href}
            className="home-nav-col group relative flex flex-col items-center justify-center gap-2 overflow-hidden"
            style={
              image ? undefined : { backgroundColor: colors[i], color: textColorFor(colors[i]) }
            }
          >
            {image && (
              <>
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover grayscale contrast-125"
                />
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ backgroundColor: colors[i] }}
                />
                <div className="absolute inset-0 bg-black/10" />
              </>
            )}
            <span
              className="relative z-10 font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl px-2 text-center"
              style={image ? { color: "#f5f5f4" } : undefined}
            >
              {section.label}
            </span>
            <span
              className="relative z-10 text-xs sm:text-sm opacity-0 -translate-y-1 group-hover:opacity-70 group-hover:translate-y-0 transition-all duration-300"
              style={image ? { color: "#f5f5f4" } : undefined}
            >
              &rarr;
            </span>
          </Link>
        );
      })}
    </div>
  );
}
