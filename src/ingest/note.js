// One note = one idea, post or chapter. This file owns the note format.
import fs from "node:fs";
import path from "node:path";

export function slugify(s) {
  return String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "")
    .trim().replace(/[\s_-]+/g, "-").slice(0, 70) || "note";
}

// Front matter is simple key: value lines. Lists are written as [a, b].
export function toMarkdown(note) {
  const fm = {
    title: note.title,
    type: note.type,          // post | article | essay | chapter | profile
    source: note.source,      // linkedin-share | linkedin-article | markdown | pdf | html
    date: note.date || "",
    topics: note.topics || [],
    summary: note.summary || "",
    public: note.public !== false,
  };
  const lines = Object.entries(fm).map(([k, v]) =>
    Array.isArray(v) ? `${k}: [${v.join(", ")}]` : `${k}: ${String(v).replace(/\n/g, " ")}`);
  const related = (note.related || []).map((r) => `- [[${r}]]`).join("\n");
  return `---\n${lines.join("\n")}\n---\n\n# ${note.title}\n\n${note.body.trim()}\n${related ? `\n## Related\n\n${related}\n` : ""}`;
}

export function parseNote(text, file = "") {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
      else if (v === "true" || v === "false") v = v === "true";
      meta[k] = v;
    }
  }
  const body = (m ? m[2] : text).replace(/^# .*\n/, "").trim();
  return { ...meta, slug: path.basename(file, ".md"), body };
}

export function writeNote(dir, note) {
  fs.mkdirSync(dir, { recursive: true });
  let slug = slugify(note.title);
  let file = path.join(dir, `${slug}.md`);
  for (let n = 2; fs.existsSync(file); n++) file = path.join(dir, `${slug}-${n}.md`);
  fs.writeFileSync(file, toMarkdown(note));
  return file;
}

export function readVault(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()
    .map((f) => parseNote(fs.readFileSync(path.join(dir, f), "utf8"), f));
}
