import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { Message, Conversation } from "@/src/components/Message";

/**
 * Compile a markdown string to rendered content.
 *
 * Painting descriptions live in the manifests as strings rather than as
 * files, but they go through the same compiler as the essays so the site has
 * one renderer rather than two that drift. The tradeoff is that they are MDX,
 * not plain markdown: a literal `<` or `{` in prose has to be escaped. Since
 * painting pages are prerendered, a bad one fails the build loudly instead of
 * rendering wrong.
 */
export async function renderMarkdown(source: string) {
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: false },
    components: { Message, Conversation },
  });
  return content;
}

export async function getPostContent(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = await fs.readFile(fullPath, "utf8");
  const { content, data } = matter(fileContent);

  return {
    // Frontmatter is already parsed out by gray-matter.
    content: await renderMarkdown(content),
    frontmatter: data,
  };
}
