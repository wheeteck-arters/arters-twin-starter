// Turns text into numbers so similar meanings sit close together.
// Gemini embeddings if GEMINI_API_KEY is set; otherwise a keyword (TF-IDF) fallback.
import { config } from "../config.js";

const MODEL = "gemini-embedding-001";

export async function geminiEmbed(texts, taskType = "RETRIEVAL_DOCUMENT") {
  const out = [];
  for (let i = 0; i < texts.length; i += 90) {
    const batch = texts.slice(i, i + 90);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:batchEmbedContents?key=${config.geminiKey}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ requests: batch.map((text) => ({ model: `models/${MODEL}`, content: { parts: [{ text }] }, taskType, outputDimensionality: 768 })) }),
    });
    if (!res.ok) throw new Error(`Gemini embeddings failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    out.push(...data.embeddings.map((e) => e.values));
  }
  return out;
}

// ---- keyword fallback ----
export function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9-]+/g) || []).filter((w) => w.length > 2);
}

export function buildIdf(docs) {
  const df = {};
  for (const d of docs) for (const t of new Set(tokens(d))) df[t] = (df[t] || 0) + 1;
  const idf = {};
  for (const [t, n] of Object.entries(df)) idf[t] = Math.log((docs.length + 1) / (n + 0.5));
  return idf;
}

export function tfidfVector(text, idf) {
  const v = {};
  for (const t of tokens(text)) if (idf[t]) v[t] = (v[t] || 0) + idf[t];
  return v;
}

export function cosine(a, b) {
  if (Array.isArray(a)) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
  }
  let dot = 0, na = 0, nb = 0;
  for (const [k, x] of Object.entries(a)) { na += x * x; if (b[k]) dot += x * b[k]; }
  for (const x of Object.values(b)) nb += x * x;
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
