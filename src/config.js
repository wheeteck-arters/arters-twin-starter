// Loads .env (if present) and exposes settings. No extra package needed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const envFile = path.join(ROOT, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const env = (k, d = "") => (process.env[k] ?? "").trim() || d;

export const config = {
  anthropicKey: env("ANTHROPIC_API_KEY"),
  twinModel: env("TWIN_MODEL", "claude-opus-5-5"),
  geminiKey: env("GEMINI_API_KEY"),
  geminiModel: env("GEMINI_MODEL"), // empty = pick the newest Flash model automatically
  name: env("TWIN_NAME", "Your Name"),
  headline: env("TWIN_HEADLINE", "What you do, in one line"),
  location: env("TWIN_LOCATION", ""),
  rateLimitPerMinute: Number(env("RATE_LIMIT_PER_MINUTE", "6")),
  dailyQuestionCap: Number(env("DAILY_QUESTION_CAP", "150")),
  port: Number(env("PORT", "3000")),
  paths: {
    vault: path.join(ROOT, "vault", "notes"),
    index: path.join(ROOT, "data", "index.json"),
    rules: path.join(ROOT, "src", "twin", "rules.md"),
    voice: path.join(ROOT, "vault", "voice.md"),
    raw: path.join(ROOT, "raw-artifacts"),
    sample: path.join(ROOT, "sample-data"),
    drafts: path.join(ROOT, "drafts"),
  },
};
