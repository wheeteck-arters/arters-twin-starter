// Topic tags, related-note links and one-line summaries.
// With GEMINI_API_KEY: Gemini reads each note and suggests topics + a summary.
// Without it: a simple keyword method, so the course works offline.
import { config } from "../config.js";
import { slugify } from "./note.js";

const STOP = new Set("the a an and or but if of to in on for with at by from is are was were be been it this that these those i you we they he she my our your their as not no so do does did can will would should could have has had just than then there changed every make made makes most good better people thing things time first really much many still even think know need want work works what when where which who why how all any more most other some such only own same very also into about over after before because while up out its it's i'm we're don't".split(" "));

function keywords(text, n = 4) {
  const counts = {};
  for (const w of text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || []) if (!STOP.has(w)) counts[w] = (counts[w] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

async function geminiTag(note) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiKey}`;
  const prompt = `Read this piece of writing. Reply with JSON only: {"topics": [3 to 5 short lowercase topics], "summary": "one sentence, under 25 words"}\n\nTITLE: ${note.title}\n\n${note.body.slice(0, 12000)}`;
  const res = await fetch(url, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

export async function tagNotes(notes) {
  let usedGemini = false;
  for (const n of notes) {
    if (config.geminiKey) {
      try { Object.assign(n, await geminiTag(n)); usedGemini = true; continue; }
      catch (e) { console.warn(`Gemini tagging failed for "${n.title}" (${e.message}); using keywords.`); }
    }
    n.topics = keywords(`${n.title} ${n.title} ${n.body}`);
    n.summary = n.body.split(/(?<=[.!?])\s/)[0].slice(0, 160);
  }
  // Link each note to the 3 notes sharing the most topics.
  for (const n of notes) {
    n.related = notes.filter((o) => o !== n)
      .map((o) => [o, o.topics.filter((t) => n.topics.includes(t)).length])
      .filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([o]) => slugify(o.title));
  }
  console.log(usedGemini ? "Topics tagged by Gemini." : "Topics tagged by keywords (add GEMINI_API_KEY for better tags).");
}
