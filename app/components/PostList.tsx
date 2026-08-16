import Link from "next/link";
import type { Post } from "@/app/generated/prisma/client";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function PostList({
  posts,
  featureFirst = false,
}: {
  posts: Post[];
  featureFirst?: boolean;
}) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
      {posts.map((post, index) => {
        const isFeatured = featureFirst && index === 0;
        return (
          <article key={post.slug}>
            <Link
              href={`/writing/${post.slug}`}
              className={`group block -mx-4 px-4 transition-colors ${
                isFeatured
                  ? "py-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  : "py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {isFeatured && (
                <p className="text-xs font-medium uppercase tracking-wide text-accent mb-1">
                  Latest
                </p>
              )}
              <time className="text-sm text-zinc-500 dark:text-zinc-500">
                {formatDate(post.date)}
              </time>
              <h2
                className={`mt-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors ${
                  isFeatured
                    ? "display-font text-3xl font-normal"
                    : "text-xl font-light"
                }`}
              >
                {post.title}
              </h2>
              {post.excerpt && (
                <p
                  className={`mt-1 text-zinc-600 dark:text-zinc-400 ${
                    isFeatured ? "text-base" : "text-sm"
                  }`}
                >
                  {post.excerpt}
                </p>
              )}
            </Link>
          </article>
        );
      })}
    </div>
  );
}