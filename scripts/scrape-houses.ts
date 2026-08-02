import { writeFile, mkdir } from "fs/promises";
import path from "path";
import * as cheerio from "cheerio";

// Full set of "37 Houses" project slugs, from brennaswitzer.com's
// wp-sitemap-posts-project-1.xml. This is the complete, unambiguous list —
// the site's own nav menu widget is stale and only surfaces 20 of these.
const SLUGS = [
  "eagle-ridge",
  "bower",
  "molina",
  "friar-tuck",
  "argonne",
  "braeburn",
  "robin-hood",
  "goodhue",
  "watson-hall",
  "faculty-club-carleton-college",
  "bank-building-division-street",
  "fountain-street",
  "ridgeway-drive",
  "4th-street",
  "32nd-street",
  "20th-street",
  "dearborn-street",
  "pacific-ave",
  "adams-street",
  "lucretia-court",
  "vancouver-ave",
  "naito-parkway",
  "macleay-gardens",
  "maplewood-road",
  "hendricks-street",
  "illinois-street",
];

const BASE_URL = "https://brennaswitzer.com";
const IMAGES_DIR = path.join(process.cwd(), "public/paintings/houses");
const MANIFEST_PATH = path.join(
  process.cwd(),
  "content/paintings/houses.json",
);

interface ScrapedHouse {
  slug: string;
  title: string;
  region: string;
  description: string;
  imageUrl: string | null;
  prevSlug: string | null;
  nextSlug: string | null;
}

function slugFromHref(href: string | undefined): string | null {
  if (!href) return null;
  const match = href.match(/\/project\/([^/]+)\/?/);
  return match ? match[1] : null;
}

function regionFromTitle(title: string): string {
  const parts = title.split(",");
  return parts[parts.length - 1].trim();
}

async function scrapeHouse(slug: string): Promise<ScrapedHouse> {
  const res = await fetch(`${BASE_URL}/project/${slug}/`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("h1.entry-title").first().text().trim();
  if (!title) {
    throw new Error(`Failed to parse title for ${slug}`);
  }

  const imageUrl = $(".entry-content").prev("img").attr("src") ?? null;
  if (!imageUrl) {
    console.warn(`Warning: ${slug} has no photo on the old site, will be excluded`);
  }

  const description = $(".entry-content")
    .find("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join("\n\n");

  const prevSlug = slugFromHref($(".nav-previous a").attr("href"));
  const nextSlug = slugFromHref($(".nav-next a").attr("href"));

  return {
    slug,
    title,
    region: regionFromTitle(title),
    description,
    imageUrl,
    prevSlug,
    nextSlug,
  };
}

function orderHouses(houses: ScrapedHouse[]): ScrapedHouse[] {
  const bySlug = new Map(houses.map((h) => [h.slug, h]));
  const scraped = new Set(houses.map((h) => h.slug));

  // A "start" is a house whose prev link either doesn't exist, or points
  // outside our scraped set (shouldn't happen since we scrape all 26, but
  // guards against a stale/broken link on the old site).
  const starts = houses.filter(
    (h) => !h.prevSlug || !scraped.has(h.prevSlug),
  );

  const ordered: ScrapedHouse[] = [];
  const visited = new Set<string>();

  for (const start of starts) {
    let current: ScrapedHouse | undefined = start;
    while (current && !visited.has(current.slug)) {
      ordered.push(current);
      visited.add(current.slug);
      current = current.nextSlug ? bySlug.get(current.nextSlug) : undefined;
    }
  }

  // Anything not reachable from a "start" (e.g. an isolated cycle) gets
  // appended in scrape order rather than silently dropped.
  for (const house of houses) {
    if (!visited.has(house.slug)) {
      console.warn(`Warning: ${house.slug} not reachable via prev/next chain, appending`);
      ordered.push(house);
      visited.add(house.slug);
    }
  }

  return ordered;
}

async function downloadImage(url: string, slug: string): Promise<string> {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  const filename = `${slug}${ext}`;
  await writeFile(path.join(IMAGES_DIR, filename), buffer);
  return `/paintings/houses/${filename}`;
}

async function main() {
  await mkdir(IMAGES_DIR, { recursive: true });

  console.log(`Scraping ${SLUGS.length} house pages...`);
  const houses = await Promise.all(SLUGS.map(scrapeHouse));

  const ordered = orderHouses(houses).filter(
    (h): h is ScrapedHouse & { imageUrl: string } => h.imageUrl !== null,
  );

  const manifest = [];
  for (let i = 0; i < ordered.length; i++) {
    const house = ordered[i];
    console.log(`[${i + 1}/${ordered.length}] ${house.slug}`);
    const imagePath = await downloadImage(house.imageUrl, house.slug);
    manifest.push({
      slug: house.slug,
      title: house.title,
      region: house.region,
      description: house.description,
      order: i,
      imagePath,
    });
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Wrote manifest for ${manifest.length} houses to ${MANIFEST_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
