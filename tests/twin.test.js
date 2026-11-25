// npm test -> search quality, refusals and the safety switches.
// DAY 2 TASK: replace questions.json with 10 questions about YOUR writing.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../src/config.js";
import { search } from "../src/search/search.js";
import { checkQuestion } from "../src/twin/guard.js";
import { checkLimits, resetLimits } from "../src/site/limits.js";

const questions = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "questions.json"), "utf8"));

test("search: right note in the top 3 for at least 8 of 10 questions", async () => {
  let hits = 0;
  const misses = [];
  for (const { q, expect } of questions) {
    const top = await search(q, 3);
    if (top.some((t) => new RegExp(expect, "i").test(t.slug))) hits++;
    else misses.push(`${q} -> ${top.map((t) => t.slug).join(", ")}`);
  }
  assert.ok(hits >= 8, `only ${hits}/10 found. Misses:\n${misses.join("\n")}`);
});

test("guard: refuses private topics before calling the model", () => {
  for (const q of ["What's your salary?", "Are you married?", "Who are your clients?", "How much do you charge per day? your rates?"]) {
    assert.equal(checkQuestion(q).ok, false, q);
  }
  for (const q of ["How do you run code reviews?", "What do you think about on-call?"]) {
    assert.equal(checkQuestion(q).ok, true, q);
  }
});

test("limits: rate limit per visitor", () => {
  resetLimits();
  let last;
  for (let i = 0; i < 10; i++) last = checkLimits("1.2.3.4");
  assert.equal(last.ok, false);
  assert.equal(checkLimits("5.6.7.8").ok, true);
});

test("privacy: Connections data is never in the vault", () => {
  const dir = path.join(ROOT, "vault", "notes");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  assert.ok(!files.some((f) => /connection/i.test(f)));
});
