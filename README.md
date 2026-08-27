# brennaswitzer.com

Personal site — writing, a painting gallery, and a CV/about page.

## Design: Block-In

A block-in is a painter's first pass: flat shapes, no detail, just structure
and value. An engineer's version is a spike, or a first draft. The site is
built around that idea.

- **`--r`** ("resolve") runs `0` → `1` on `<html>` and is the only piece of
  state the design has. At `0` the page is its block-in — flat fields of
  paint where the content goes, with the column grid showing. At `1` it is
  the finished sheet. `Scrubber.tsx` sets it (imperatively, on every
  animation frame, so it never re-renders); everything else reads it in CSS
  via `.bi`, `.hl` and `.plate-img::after`. The page paints itself in once on
  load, and `prefers-reduced-motion` skips straight to `1`.
- **The chrome is drawn.** Title block, register marks, hairline rules, a
  twelve-column guide — the Houses series is graphite, so the structure of
  the site is line and the paintings supply all of the colour.
- **The palette is sampled, not invented.** `scripts/sample-paintings.py`
  reads every painting and writes one signature colour and its true
  proportions into the manifests, from where `pnpm seed:paintings` loads them
  into the `field` and `ratio` columns. Dominant-colour extraction is useless
  on photographs of paint on paper — everything comes back paper — so it
  filters out anything too pale or too dark to read as a field and ranks the
  rest by area weighted toward saturation, then pulls chroma and value into
  the band the rest of the design lives in. Because the values live in
  content, a bad sample can be corrected by hand and will survive a reseed.
- **The colour maths is one module.** `app/lib/color.ts` owns contrast,
  the readability walk that keeps a pale sampled tint legible, and the hue
  sort. `app/lib/rows.ts` owns the justified-row packing behind the
  galleries. Both are pure and both are tested — `pnpm test`, no test
  runner to install.
- **Type**: Archivo (width axis, set expanded) for headings, Newsreader for
  prose, JetBrains Mono for every label, date and caption.
- **Empty fields show as gaps, not guesses.** A plate page renders an em dash
  for anything the manifest has not filled, and only draws its dimension line
  when there is a measurement to draw. Fill `dimensions` on a painting and
  the annotation appears.
- **Painting descriptions are markdown**, compiled by the same renderer as
  the essays (`renderMarkdown` in `app/lib/mdx.ts`). That makes them MDX in
  practice, so a literal `<` or `{` in prose needs escaping; because the
  pages are prerendered, a bad one fails the build rather than rendering
  wrong.

Rerun the sampler after adding paintings, then reseed:

```bash
python3 scripts/sample-paintings.py   # --force to resample existing entries
pnpm seed:paintings
```

## Stack

- **Next.js 16** (App Router, React 19)
- **Prisma 7** + **better-sqlite3** — SQLite is used here purely as a more
  convenient file-based content store than hand-rolled JSON; content still
  lives in git as MDX/JSON, and the database is rebuilt from it via the seed
  scripts below. If this ever needs a "real" database, swap the adapter and
  `DATABASE_URL`.
- **Tailwind CSS 4**
- **next-mdx-remote** + **gray-matter** for rendering blog posts from MDX

## Getting started

```bash
pnpm install
cp .env.example .env          # DATABASE_URL="file:./dev.db"
pnpm prisma generate
pnpm prisma migrate deploy    # create dev.db from prisma/migrations
pnpm seed                     # populate Post rows from content/posts/*.mdx
pnpm seed:paintings           # populate Painting rows from content/paintings/*.json
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content model

Source content lives in git; the database is a derived, queryable index over
it — regenerate it any time with the seed scripts rather than editing rows by
hand.

- **Writing** — `content/posts/*.mdx` (frontmatter: `title`, `date`,
  `description`). `prisma/seed.ts` upserts one `Post` row per file, keyed by a
  slug derived from the filename. The MDX body is read and rendered at
  request time from `filePath`; the DB only stores metadata used for listing
  and lookup.
- **Paintings** — `content/paintings/<collection>.json` manifests (one file
  per collection: sketches, houses, abstract-landscape, still-life). The
  `field` and `ratio` keys are written by the sampler rather than by hand.
  `prisma/seed-paintings.ts` upserts one `Painting` row per manifest entry.
  Images live in `public/`.

## Project structure

```
app/
  page.tsx                Home
  about/                   About / CV
  writing/                 Post listing + [slug] MDX rendering
  painting/                Gallery listing + [collection] view
  lib/                     Prisma client, MDX helpers, collection config,
                           colour maths and gallery row packing (+ tests)
  components/              Sheet chrome (TitleBlock, FootRule, Scrubber,
                           Gridlines) and content components (Plate, PostList)
  generated/prisma/        Generated Prisma client (gitignored)
content/
  posts/                   MDX blog posts
  paintings/               Per-collection JSON manifests
prisma/
  schema.prisma
  migrations/
  seed.ts                  Seeds Post from content/posts
  seed-paintings.ts        Seeds Painting from content/paintings
scripts/
  scrape-houses.ts         One-off scraper used to source painting data
  sample-paintings.py      Samples block-in colour + aspect ratio per painting
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
| `pnpm seed` | Reseed `Post` rows from `content/posts` |
| `pnpm seed:paintings` | Reseed `Painting` rows from `content/paintings` |
| `pnpm test` | Unit tests for the colour and layout helpers (Node's built-in runner) |
| `python3 scripts/sample-paintings.py` | Sample block-in colours and aspect ratios into the painting manifests |

## Database

`dev.db` is committed to the repo and treated as build output derived from
`content/`: after editing a post or painting manifest, rerun the relevant
seed script and commit the updated `dev.db` alongside the content change. The
site only reads from it at runtime — there's no admin/write path in
production, which is what makes it safe to deploy as-is (see below).

## Deployment

Deployed on Vercel. A couple of things specific to this setup:

- Vercel's serverless functions have a read-only filesystem at runtime, so
  writes to `dev.db` won't persist — that's fine since this app is read-only
  in production. All content changes happen locally (edit → reseed → commit →
  push).
- `better-sqlite3` is a native module; Vercel rebuilds it during install for
  the target platform, so no extra config is needed there.
- Set `DATABASE_URL=file:./dev.db` in the Vercel project's environment
  variables to match local.
