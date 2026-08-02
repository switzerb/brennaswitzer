import { readdirSync, readFileSync } from "fs";
import path from "path";
import matter from "gray-matter";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const postsDir = path.join(process.cwd(), "content/posts");

function slugify(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split(/[-/]/).map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  const files = readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const { data } = matter(readFileSync(fullPath, "utf8"));

    const nameWithoutDate = file
      .replace(/\.mdx$/, "")
      .replace(/^\d{4}[-_]\d{2}[-_]\d{2}-/, "");
    const slug = slugify(nameWithoutDate);

    const fields = {
      title: data.title as string,
      date: parseDate(data.date as string),
      excerpt: (data.description as string) ?? null,
      filePath: `content/posts/${file}`,
      published: true,
    };

    await prisma.post.upsert({
      where: { slug },
      update: fields,
      create: { slug, ...fields },
    });

    console.log(`Seeded post: ${slug}`);
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