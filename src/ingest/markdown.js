// Markdown and text files (Substack/Medium/Ghost exports, your own notes).
import path from "node:path";

export function parseMarkdownFile(file, text) {
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  let meta = {};
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
    text = text.slice(fm[0].length);
  }
  const h1 = text.match(/^#\s+(.+)$/m);
  const title = meta.title || h1?.[1]?.trim() || path.basename(file).replace(/\.(md|txt)$/, "").replace(/[-_]/g, " ");
  const body = h1 ? text.replace(h1[0], "").trim() : text.trim();
  return { title, type: meta.type || "essay", source: "markdown", date: (meta.date || "").slice(0, 10), body };
}
