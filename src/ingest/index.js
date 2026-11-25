// npm run ingest          -> reads raw-artifacts/ (your writing + LinkedIn export)
// npm run ingest:sample   -> reads sample-data/ (Mei Lin, a made-up engineering lead)
// Writes one Markdown note per piece into vault/notes/, then tags topics.
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { writeNote, slugify } from "./note.js";
import { parseLinkedIn } from "./linkedin.js";
import { parseMarkdownFile } from "./markdown.js";
import { parseHtmlFile } from "./html.js";
import { parsePdf } from "./pdf.js";
import { tagNotes } from "./tag.js";

const useSample = process.argv.includes("--sample");
const src = useSample ? config.paths.sample : config.paths.raw;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
}

async function main() {
  const notes = [];
  const skipped = [];

  // LinkedIn export: any folder containing Shares.csv
  const shareFiles = walk(src).filter((f) => path.basename(f) === "Shares.csv");
  const linkedinDirs = shareFiles.map((f) => path.dirname(f));
  for (const dir of linkedinDirs) notes.push(...parseLinkedIn(dir));

  for (const file of walk(src)) {
    if (path.basename(file).toLowerCase() === "readme.md") continue;
    if (linkedinDirs.some((d) => file.startsWith(d + path.sep))) continue;
    const ext = path.extname(file).toLowerCase();
    try {
      if (ext === ".md" || ext === ".txt") notes.push(parseMarkdownFile(file, fs.readFileSync(file, "utf8")));
      else if (ext === ".html" || ext === ".htm") notes.push(parseHtmlFile(file, fs.readFileSync(file, "utf8")));
      else if (ext === ".pdf") notes.push(await parsePdf(file));
      else if (path.basename(file) !== "README.md") skipped.push(`${path.relative(src, file)} (unknown type)`);
    } catch (e) {
      skipped.push(`${path.relative(src, file)}: ${e.message}`);
    }
  }

  const good = notes.filter((n) => n.body && n.body.length >= 80);
  await tagNotes(good);

  // Fresh vault each run, so re-running is safe.
  fs.rmSync(config.paths.vault, { recursive: true, force: true });
  for (const n of good) writeNote(config.paths.vault, n);

  console.log(`Wrote ${good.length} notes to vault/notes from ${path.relative(process.cwd(), src) || src}`);
  if (skipped.length) console.log(`Skipped ${skipped.length}:\n  ` + skipped.join("\n  "));
  console.log("Next: open the vault folder in Obsidian, then run: npm run index");
}

main().catch((e) => { console.error(e); process.exit(1); });
export { slugify };
