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

// Gemini model names change often, so unless GEMINI_MODEL is set we ask Google
// which models this key can use and try the newest stable "flash" ones first.
const API = "https://generativelanguage.googleapis.com/v1beta";
let candidates;
async function modelCandidates() {
  if (candidates) return candidates;
  if (config.geminiModel) return (candidates = [config.geminiModel]);
  const res = await fetch(`${API}/models?pageSize=200&key=${config.geminiKey}`);
  if (!res.ok) throw new Error(`Gemini model list ${res.status}`);
  const { models = [] } = await res.json();
  const ok = models.filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((n) => /flash/.test(n) && !/(lite|preview|exp|image|tts|live|audio|thinking)/.test(n));
  const version = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  ok.sort((a, b) => version(b) - version(a) || a.length - b.length);
  if (!ok.length) throw new Error("no Flash model available for this key");
  return (candidates = ok.slice(0, 3));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One call to one model. Retries "busy" (503) and "too fast" (429) answers,
// waiting longer each time, as Google asks.
async function callModel(model, prompt) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}/models/${model}:generateContent?key=${config.geminiKey}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }),
    });
    if (res.ok) {
      const data = await res.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    }
    if ((res.status === 429 || res.status === 503) && attempt < 4) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * 2 ** attempt; // 2, 4, 8, 16 s
      await sleep(wait);
      continue;
    }
    const err = new Error(`Gemini ${res.status}`);
    err.status = res.status;
    throw err;
  }
}

// Try the current model; if it stays busy or is missing, move to the next one.
let current = 0;
let announced = "";
async function geminiTag(note) {
  const models = await modelCandidates();
  const prompt = `Read this piece of writing. Reply with JSON only: {"topics": [3 to 5 short lowercase topics], "summary": "one sentence, under 25 words"}\n\nTITLE: ${note.title}\n\n${note.body.slice(0, 12000)}`;
  while (current < models.length) {
    const model = models[current];
    if (announced !== model) { console.log(`Using Gemini model ${model} for topic tags.`); announced = model; }
    try { return await callModel(model, prompt); }
    catch (e) {
      if ([404, 429, 503].includes(e.status) && current < models.length - 1) { current++; continue; }
      throw e;
    }
  }
  throw new Error("no Gemini model available");
}

export async function tagNotes(notes) {
  let usedGemini = false;
  let geminiOn = Boolean(config.geminiKey);
  for (const n of notes) {
    if (geminiOn) {
      try { Object.assign(n, await geminiTag(n)); usedGemini = true; continue; }
      catch (e) {
        // Stop asking after a hard failure so the screen isn't flooded; the rest use keywords.
        console.warn(`Gemini tagging stopped at "${n.title}" (${e.message}); the remaining notes use keywords. Try again later.`);
        geminiOn = false;
      }
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
  console.log(usedGemini ? "Topics tagged by Gemini." : config.geminiKey ? "Topics tagged by keywords (Gemini was unavailable)." : "Topics tagged by keywords (add GEMINI_API_KEY for better tags).");
}
