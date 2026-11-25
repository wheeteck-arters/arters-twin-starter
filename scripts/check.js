// npm run check -> confirms your laptop is ready. Send a screenshot of the result.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { config, ROOT } from "../src/config.js";

const results = [];
const ok = (name, detail) => results.push({ pass: true, name, detail });
const fail = (name, fix) => results.push({ pass: false, name, detail: fix });
const run = (cmd) => { try { return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return null; } };

const [major] = process.versions.node.split(".").map(Number);
major >= 20 ? ok("Node.js", process.versions.node) : fail("Node.js", `found ${process.versions.node}, need 20 or newer from nodejs.org`);

const git = run("git --version");
git ? ok("Git", git.replace("git version ", "")) : fail("Git", "install Git from git-scm.com");

const claude = run("claude --version");
claude ? ok("Claude Code", claude) : fail("Claude Code", "install it: see docs.claude.com > Claude Code > Quickstart");

fs.existsSync(path.join(ROOT, "node_modules", "express")) ? ok("Packages", "installed") : fail("Packages", "run: npm install");
fs.existsSync(path.join(ROOT, ".env")) ? ok(".env file", "found") : fail(".env file", "copy .env.example to .env");

const looksLike = (v, re) => v && re.test(v);
looksLike(config.anthropicKey, /^sk-ant-/) ? ok("Anthropic key", "set") : fail("Anthropic key", "add ANTHROPIC_API_KEY to .env (console.anthropic.com > API keys)");
looksLike(config.geminiKey, /^[A-Za-z0-9_-]{30,}$/) ? ok("Gemini key", "set") : fail("Gemini key", "add GEMINI_API_KEY to .env (aistudio.google.com > Get API key)");

async function live() {
  if (process.argv.includes("--offline")) return;
  if (config.anthropicKey) {
    const r = await fetch("https://api.anthropic.com/v1/models", { headers: { "x-api-key": config.anthropicKey, "anthropic-version": "2023-06-01" } }).catch(() => null);
    r?.ok ? ok("Anthropic key works", "200 OK") : fail("Anthropic key works", `got ${r?.status ?? "no connection"}: check the key and billing`);
  }
  if (config.geminiKey) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.geminiKey}`).catch(() => null);
    r?.ok ? ok("Gemini key works", "200 OK") : fail("Gemini key works", `got ${r?.status ?? "no connection"}: check the key`);
  }
}

const railway = run("railway --version");
railway ? ok("Railway CLI (optional)", railway) : ok("Railway CLI (optional)", "not installed; you'll deploy from the Railway website");

await live();
console.log("\nArters Twin starter: setup check\n");
for (const r of results) console.log(`${r.pass ? "\x1b[32m PASS \x1b[0m" : "\x1b[31m FIX  \x1b[0m"} ${r.name.padEnd(24)} ${r.detail}`);
const bad = results.filter((r) => !r.pass).length;
console.log(bad ? `\n${bad} item(s) to fix. Fix them and run npm run check again.\n` : "\nAll green. Screenshot this and send it in. See you on Day 1!\n");
process.exit(bad ? 1 : 0);
