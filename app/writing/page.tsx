import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { PostSubnav } from "@/app/components/PostSubnav";
import { PostList } from "@/app/components/PostList";

export const metadata: Metadata = {
  title: "Merge Anxiety",
  description:
    "Notes on software, systems and craft — plus an ongoing series of conversations with the machines.",
};

export default async function WritingPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="sheet-pad">
      <div className="measure">
        <header className="sheet-head">
          <h1>Merge Anxiety</h1>
          <p className="blurb">
            Notes on software, systems and craft &mdash; plus an ongoing series
            of conversations with the machines.
          </p>
        </header>

        <PostSubnav />
        <PostList posts={posts} featureFirst />
      </div>
    </div>
  );
}
