// Cheap first line of defence: questions on these topics get a polite fixed
// reply and never reach the model. The rules in rules.md are the second line.
// DAY 2 TASK: add your own off-limits topics.
export const BLOCKED = [
  { topic: "pay", pattern: /\b(salary|salaries|how much (do|did) you (earn|make|charge)|your rates?|day rate|pay(check)?|income|net worth)\b/i },
  { topic: "private life", pattern: /\b(married|wife|husband|girlfriend|boyfriend|kids|children|divorce|religio\w*|politic\w*|vote|health|illness|address|where do you live)\b/i },
  { topic: "clients", pattern: /\b(clients?|customers?) (list|names?)\b|\bwho (are|were) your clients\b|\bname (a|your|the) clients?\b/i },
];

export const REFUSAL = "That's not something I talk about here. Ask me about my work and the ideas I write about instead.";

export function checkQuestion(q) {
  const text = String(q || "").trim();
  if (!text) return { ok: false, reason: "empty", reply: "Ask me a question about my work." };
  if (text.length > 500) return { ok: false, reason: "too long", reply: "Please keep questions under 500 characters." };
  const hit = BLOCKED.find((b) => b.pattern.test(text));
  if (hit) return { ok: false, reason: hit.topic, reply: REFUSAL };
  return { ok: true };
}
