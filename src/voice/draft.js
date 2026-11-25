// npm run draft -- "topic for a new post"
// Drafts a LinkedIn-length post in your voice, using your closest past posts as
// style examples. Saves to drafts/. Nothing is ever published automatically.
// DAY 2 TASK: write vault/voice.md (how you write), then improve the prompt below.
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { search } from "../search/search.js";
import { slugify } from "../ingest/note.js";

const topic = process.argv.slice(2).join(" ");
if (!topic) { console.log('Usage: npm run draft -- "topic"'); process.exit(0); }
if (!config.anthropicKey) { console.error("Add ANTHROPIC_API_KEY to .env first."); process.exit(1); }

const examples = await search(topic, 4);
const voice = fs.existsSync(config.paths.voice) ? fs.readFileSync(config.paths.voice, "utf8") : "(no voice.md yet)";

const prompt = `Write a LinkedIn post of 150 to 250 words on this topic: ${topic}

How I write (my voice file):
${voice}

Passages from my past writing, for style and for facts. Use only facts found here:
${examples.map((e, i) => `[${i + 1}] ${e.title}\n${e.text}`).join("\n\n")}

Rules: sound like me, not like a marketer. No hashtags unless my examples use them.
Where you need a fact my passages don't have, write [GAP: what's missing] instead of inventing it.
End with a list of the passage numbers you drew on.`;

const client = new Anthropic({ apiKey: config.anthropicKey });
const response = await client.beta.messages.create({
  model: config.twinModel,
  max_tokens: 4096,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
  messages: [{ role: "user", content: prompt }],
});
if (response.stop_reason === "refusal") { console.error("The model declined this topic."); process.exit(1); }
const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
fs.mkdirSync(config.paths.drafts, { recursive: true });
const file = path.join(config.paths.drafts, `${new Date().toISOString().slice(0, 10)}-${slugify(topic)}.md`);
fs.writeFileSync(file, `---\nstatus: draft (needs your approval)\ntopic: ${topic}\n---\n\n${text}\n`);
console.log(`${text}\n\nSaved to ${path.relative(process.cwd(), file)}. Edit it, then publish it yourself.`);
