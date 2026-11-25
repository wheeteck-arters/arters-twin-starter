// npm run ask -- "What do you think about code review?"
import { askTwin } from "./ask.js";
const q = process.argv.slice(2).join(" ");
if (!q) { console.log('Usage: npm run ask -- "your question"'); process.exit(0); }
const r = await askTwin(q);
console.log(`\n${r.answer}\n`);
for (const s of r.sources) console.log(`  [${s.n}] ${s.title}  (vault/notes/${s.slug}.md)`);
