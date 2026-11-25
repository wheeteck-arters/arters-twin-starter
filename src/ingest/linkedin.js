// LinkedIn data export parser. WORKING: Shares.csv and Articles (HTML).
// The full archive unzips to a folder; point this at that folder.
// Never imports Connections.csv: other people's personal data stays out (PDPA).
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { htmlToText } from "./html.js";

function firstLine(text, n = 70) {
  const line = text.split(/\n|(?<=[.!?])\s/)[0].trim();
  return line.length > n ? line.slice(0, n).replace(/\s+\S*$/, "") + "..." : line;
}

export function parseShares(csvFile) {
  const rows = parse(fs.readFileSync(csvFile, "utf8"), { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true });
  return rows
    .map((r) => ({ date: (r.Date || "").slice(0, 10), text: (r.ShareCommentary || "").replace(/""/g, '"').trim(), link: r.ShareLink || "" }))
    .filter((r) => r.text.length > 80) // skip one-liners and bare reshares
    .map((r) => ({ title: firstLine(r.text), type: "post", source: "linkedin-share", date: r.date, body: r.text }));
}

export function parseArticles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => {
    const html = fs.readFileSync(path.join(dir, f), "utf8");
    const title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || f.replace(/\.html$/, "")).replace(/<[^>]+>/g, "").trim();
    const date = html.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || "";
    const body = htmlToText(html.replace(/<h1[\s\S]*?<\/h1>/i, "").replace(/<p class="created">[\s\S]*?<\/p>/i, ""));
    return { title, type: "article", source: "linkedin-article", date, body };
  });
}

export function parseLinkedIn(exportDir) {
  const notes = [];
  const shares = path.join(exportDir, "Shares.csv");
  if (fs.existsSync(shares)) notes.push(...parseShares(shares));
  notes.push(...parseArticles(path.join(exportDir, "Articles", "Articles")));
  return notes;
}
