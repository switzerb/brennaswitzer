import { readFileSync, readdirSync } from "fs";
import path from "path";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// One manifest file per collection, named after it:
// content/paintings/<collection>.json
interface PaintingManifestEntry {
  slug: string;
  title: string;
  region?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  date?: string | null;
  description?: string | null;
  order: number;
  imagePath: string;
}

async function main() {
  const manifestDir = path.join(process.cwd(), "content/paintings");
  const files = readdirSync(manifestDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const collection = file.replace(/\.json$/, "");
    const entries: PaintingManifestEntry[] = JSON.parse(
      readFileSync(path.join(manifestDir, file), "utf8"),
    );

    for (const entry of entries) {
      const fields = {
        title: entry.title,
        collection,
        imagePath: entry.imagePath,
        region: entry.region ?? null,
        medium: entry.medium ?? null,
        dimensions: entry.dimensions ?? null,
        date: entry.date ? new Date(entry.date) : null,
        description: entry.description ?? null,
        order: entry.order,
      };

      await prisma.painting.upsert({
        where: { slug: entry.slug },
        update: fields,
        create: { slug: entry.slug, ...fields },
      });

      console.log(`Seeded painting: ${collection}/${entry.slug}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
