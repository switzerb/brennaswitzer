# brennaswitzer.com — Implementation Plan

## Purpose

Personal site for Brenna Switzer combining three things:

- **Writing** — "Merge Anxiety," a technical blog on software, systems, and craft (migrated from the standalone `merge-anxiety` site).
- **Painting** — a portfolio of painting collections (sketches, houses, abstract landscape, still life).
- **Resume** - a CV and some other information for getting a new job, or at least looking good when people google me when I apply.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Data**: Prisma 7 + SQLite, via the `@prisma/adapter-better-sqlite3` driver adapter (required in Prisma v7 — no more implicit engine binary)
- **Content**: hybrid model — Prisma holds metadata/ordering (`Post`, `Painting`), actual post prose lives as MDX files on disk under `content/posts/`, compiled at request time with `next-mdx-remote/rsc` + `gray-matter`
- **Package manager**: pnpm

## Status

### Writing — done
- `Post` model + migration
- `prisma/seed.ts` seeds from `content/posts/*.mdx` frontmatter
- 9 posts migrated from the old `merge-anxiety` site, clean slugs (date prefix stripped)
- `/writing` (list) and `/writing/[slug]` (detail, with `generateStaticParams`) wired to Prisma + MDX rendering

### Painting — Houses done, other collections not started
- Routes renamed `/art` → `/painting` for consistency (deliberately calling it "painting," not "art")
- **Houses**: migrated from the old site's "37 Houses" project. `region` field added to `Painting` model; `scripts/scrape-houses.ts` scraped all 26 `/project/*` pages from brennaswitzer.com (one, Fountain Street, had no photo on the old site and was excluded), reconstructed true order from the site's own prev/next chain, downloaded images to `public/paintings/houses/`, wrote `content/paintings/houses.json`; `prisma/seed-paintings.ts` seeds 25 `Painting` rows from that manifest. `/painting/houses` (gallery, grouped by region) and `/painting/houses/[slug]` (detail, with prev/next) wired to Prisma.
- **Sketches / Abstract Landscape / Still Life**: still render hardcoded "coming soon" placeholders — no old-site content to port, blocked on Brenna sourcing/digitizing images (including old slides)

## Roadmap

### Interactive visualizations (Writing)

Philosophy: this blog's audience is me, not the world. I'm a visual/experiential learner — the goal is a clear "ah-hah" moment (e.g. finally *getting* binary search), not a generic runnable-code sandbox. That's why Sandpack got ripped out: it solved "run arbitrary code," not "make the mental model click," and came with unmaintained-library risk on top.

- **Step player** (shared primitive) — a generic, snapshot-based player: takes an array of arbitrary "steps," provides play/pause/prev/next/scrub controls and the current step. Plain React (`"use client"`) component/hook, registered via `mdxComponents` same as `TypeScriptRepl` was. No iframe, no bundler, fully owned code.
  - Snapshot-based (not operation-based) so it works for anything expressible as a sequence of states — doesn't require every visualization's steps to be reversible operations.
  - Per-concept visualizations only need to supply two things: how to generate the sequence of steps, and how to render one step (SVG/Canvas/DOM — whatever fits the concept).
- **First prototypes**:
  - Binary search — array with animated low/mid/high pointers
  - Gang of Four design patterns, starting with **Command** — ties back to the "more on both of those later in this series" line at the end of `actor-pattern.mdx`. Special treatment: instead of using the generic snapshot player, Command's demo is built from real `Command` objects with `execute()`/`undo()` — playing backward literally calls `.undo()` on a command instance, so the demo doesn't just illustrate the pattern, it *is* the pattern.
  - Other GoF candidates once Command is done: Observer (also teased in `actor-pattern.mdx`), Decorator, Strategy

### Painting

**Context**: the goal for this session is to get the new site to "good enough" so the old WordPress site (brennaswitzer.com) can be shut down. The old site turns out to be small: a bio homepage, a contact page, the blog (already migrated to `/writing`), and **37 Houses** — 26 individual painting pages (one per residence Brenna has lived in), each with a full-res photo and a short personal essay, chained together with prev/next links and organized by city. That's the only real content at risk of being lost — Sketches, Abstract Landscape, and Still Life have no old-site precedent (new/future work, some pending digitizing old slides), so they stay as lightweight "coming soon" placeholders for now.

Confirmed by inspecting the live HTML (`curl`, not the lossy AI-summarized fetch) of a sample page (`/project/illinois-street/`) and the full 26-URL list from `wp-sitemap-posts-project-1.xml`:
- Consistent Divi markup per page: `h1.entry-title` (format `"<Street>, <City>"`), a single `<img>` (full-res, e.g. `.../wp-content/uploads/2017/10/IMG_20170625_104303.jpg`) right before `.entry-content`, then `.entry-content` holding the essay paragraphs, then `.nav-single .nav-previous a` / `.nav-next a` linking to the neighboring house.
- The site's own prev/next chain is the authoritative order (better than the sitemap, which is alphabetical-ish by slug, and better than the site's nav menu widget, which is stale and only lists 20 of the 26 houses).
- City is reliably the substring after the **last** comma in the title (handles multi-comma titles like "NW 29th Ave, MacLeay Gardens, Portland").

**Approach**: mirror the Writing feature's hybrid pattern (Prisma metadata + files on disk) — same shape, images instead of MDX.

1. **Schema** — add `region String?` to the `Painting` model (`prisma/schema.prisma`) to hold the city (parsed from title), used to group the houses gallery the way the old sidebar did. Run `pnpm prisma migrate dev --name add-painting-region`.

2. **One-time scrape script — `scripts/scrape-houses.ts`**
   - Add `cheerio` as a devDependency for HTML parsing.
   - Fetch all 26 `/project/<slug>/` pages (list hardcoded from the sitemap — the complete, unambiguous set).
   - Per page extract: title, essay text (`.entry-content` paragraphs), full-res image URL, and the `nav-previous`/`nav-next` hrefs.
   - Reconstruct true order by chaining the prev/next links into a single sequence.
   - Parse `region` = text after the last comma in the title.
   - Download each image to `public/paintings/houses/<slug>.<ext>`.
   - Write `content/paintings/houses.json`: array of `{ slug, title, region, description, order, imagePath }`.
   - Run once manually: `pnpm tsx scripts/scrape-houses.ts`. The manifest + downloaded images get committed; the script stays in the repo as a record (mirrors how `prisma/seed.ts` documents the writing migration).

3. **Seed — `prisma/seed-paintings.ts`** — same upsert pattern as `prisma/seed.ts`: read `content/paintings/houses.json`, `prisma.painting.upsert` each row with `collection: "houses"`. Run manually via `pnpm tsx prisma/seed-paintings.ts`.

4. **Routes**
   - `app/painting/houses/page.tsx` (replace placeholder) — query paintings ordered by `order`, render sequentially with a heading whenever `region` changes (data-driven, no hardcoded city list). Thumbnails via `next/image` (`fill` + `object-cover` in an `aspect-[4/3]` container, matching the `/painting` index card style), linking to `/painting/houses/[slug]`.
   - `app/painting/houses/[slug]/page.tsx` (new dynamic route, mirrors `app/writing/[slug]/page.tsx`) — `generateStaticParams` from Prisma, `notFound()` if missing, renders title, region, full image (`next/image` `fill` + `object-contain`, nothing cropped), and the essay (`whitespace-pre-line`). Prev/next computed from neighboring `order` values within `collection: "houses"`.
   - No `next.config.js` changes needed — all images are local (`public/`), which `next/image` optimizes without `remotePatterns`.

**Out of scope for this pass**: Sketches / Abstract Landscape / Still Life stay as-is. A persistent nav bar and a dedicated Contact page (the old site had one) aren't part of the painting feature but are a fast follow before fully killing the old site.

**Verification**: after seeding, confirm 26 `Painting` rows with `collection: "houses"` (`pnpm prisma studio` or a count query). `pnpm dev` → `/painting/houses` should show all 26 thumbnails grouped by city in the site's original order; click through several to `/painting/houses/[slug]` and spot-check image + essay text + prev/next against the corresponding live `brennaswitzer.com/project/<slug>/` pages for fidelity.

### Resume
_(not yet planned)_