// Safety switches for the public "Ask my Twin" box.
// 1) per-visitor rate limit  2) a daily cap on questions, so a bot can't run up your bill.
import { config } from "../config.js";

const hits = new Map(); // ip -> [timestamps]
let day = new Date().toISOString().slice(0, 10);
let todayCount = 0;

export function checkLimits(ip, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) { day = today; todayCount = 0; hits.clear(); }
  if (todayCount >= config.dailyQuestionCap) return { ok: false, status: 503, reply: "My Twin has answered all the questions it can for today. Please come back tomorrow." };
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= config.rateLimitPerMinute) return { ok: false, status: 429, reply: "That's a lot of questions at once. Give me a minute." };
  recent.push(now); hits.set(ip, recent); todayCount++;
  return { ok: true };
}

export function usageToday() { return { day, questions: todayCount, cap: config.dailyQuestionCap }; }
export function resetLimits() { hits.clear(); todayCount = 0; }
