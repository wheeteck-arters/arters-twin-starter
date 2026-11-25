// The Twin: search my notes, then answer only from what was found, with sources.
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { search } from "../search/search.js";
import { checkQuestion } from "./guard.js";

const MIN_SCORE = 0.08; // below this, the notes probably don't cover the question

let client;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: config.anthropicKey });
  return client;
}

export function systemPrompt() {
  return fs.readFileSync(config.paths.rules, "utf8")
    .replace(/^DAY 2 TASK:.*\n/m, "")
    .replaceAll("{{NAME}}", config.name)
    .replaceAll("{{HEADLINE}}", config.headline);
}

function sourcesOf(passages) {
  return passages.map((p, i) => ({ n: i + 1, title: p.title, slug: p.slug, url: `/posts/${p.slug}` }));
}

export async function askTwin(question) {
  const check = checkQuestion(question);
  if (!check.ok) return { answer: check.reply, sources: [], refused: check.reason };

  const passages = (await search(question, 4)).filter((p) => p.score >= MIN_SCORE);
  if (!passages.length) return { answer: "I haven't written about that yet.", sources: [], refused: "no sources" };

  // No Claude key (for example during setup): show the passages instead of an answer.
  if (!config.anthropicKey) {
    return {
      answer: "My answer-writer isn't switched on yet, but here is what I've written that looks related.",
      sources: sourcesOf(passages), offline: true,
    };
  }

  const context = passages.map((p, i) => `[${i + 1}] ${p.title}${p.date ? ` (${p.date})` : ""}\n${p.text}`).join("\n\n");
  const response = await getClient().beta.messages.create({
    model: config.twinModel,
    max_tokens: 1024,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: systemPrompt(),
    messages: [{ role: "user", content: `Passages from my writing:\n\n${context}\n\nVisitor's question: ${question}` }],
  });

  if (response.stop_reason === "refusal") {
    return { answer: "I can't help with that one.", sources: [], refused: "model" };
  }
  const answer = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  // Show only the sources the answer actually cites, e.g. [1] or [2].
  const cited = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  const sources = sourcesOf(passages).filter((s) => !cited.size || cited.has(s.n));
  return { answer, sources, usage: response.usage };
}
