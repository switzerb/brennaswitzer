# brennaswitzer.com

Personal site — writing, a painting gallery, and a CV/about page. Nice and boring for now.

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
  per collection: sketches, houses, abstract-landscape, still-life).
  `prisma/seed-paintings.ts` upserts one `Painting` row per manifest entry.
  Images live in `public/`.

## Project structure

```
app/
  page.tsx                Home
  about/                   About / CV
  writing/                 Post listing + [slug] MDX rendering
  painting/                Gallery listing + [collection] view
  lib/                     Prisma client, MDX helpers, collection/palette config
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
