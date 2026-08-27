import { readdirSync, readFileSync } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import matter from "gray-matter";
import { revisionLabel } from "../app/lib/revisions";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const postsDir = path.join(process.cwd(), "content/posts");
const run = promisify(execFile);

// Unit separator: commit subjects can contain anything else.
const FIELD = "\u001f";

interface Revision {
  date: Date;
  subject: string;
  commit: string;
}

/**
 * The commits that touched one file, oldest first.
 *
 * Read here rather than at build or request time on purpose: the deploy
 * build is a shallow clone and a serverless runtime has no git binary, so
 * the only place the full history exists is a local checkout. It travels to
 * production inside dev.db like the rest of the content.
 */
async function gitHistory(filePath: string): Promise<Revision[]> {
  try {
    const { stdout } = await run("git", [
      "log",
      "--follow",
      `--format=%h${FIELD}%aI${FIELD}%s`,
      "--",
      filePath,
    ]);

    return stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [commit, iso, subject] = line.split(FIELD);
        return { commit, date: new Date(iso), subject };
      })
      .reverse();
  } catch {
    // No git, no history, no revision block. Not a reason to fail a seed.
    console.warn(`  no git history for ${filePath}`);
    return [];
  }
}

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

function findMdxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findMdxFiles(fullPath);
    return entry.name.endsWith(".mdx") ? [fullPath] : [];
  });
}

async function main() {
  const files = findMdxFiles(postsDir);

  for (const fullPath of files) {
    const { data } = matter(readFileSync(fullPath, "utf8"));

    const nameWithoutDate = path
      .basename(fullPath, ".mdx")
      .replace(/^\d{4}[-_]\d{2}[-_]\d{2}-/, "");
    const slug = slugify(nameWithoutDate);

    const fields = {
      title: data.title as string,
      date: parseDate(data.date as string),
      excerpt: (data.description as string) ?? null,
      series: path.basename(path.dirname(fullPath)),
      filePath: path.relative(process.cwd(), fullPath),
      published: true,
    };

    await prisma.post.upsert({
      where: { slug },
      update: fields,
      create: { slug, ...fields },
    });

    // Replaced wholesale rather than merged: git is the source of truth and
    // a rebase can rewrite hashes under us.
    const history = await gitHistory(fields.filePath);
    await prisma.revision.deleteMany({ where: { postSlug: slug } });
    if (history.length > 0) {
      await prisma.revision.createMany({
        data: history.map((revision, index) => ({
          postSlug: slug,
          label: revisionLabel(index),
          date: revision.date,
          subject: revision.subject,
          commit: revision.commit,
          order: index,
        })),
      });
    }

    console.log(`Seeded post: ${slug} (${history.length} revisions)`);
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