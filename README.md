# Arters Twin Starter

Starter repo for **AI-Native Engineering: the 3-Day Guided Build Sprint** by Arters.
In three days you turn your own writing into a Digital Twin and ship it as a personal site
with an "Ask my Twin" bot that answers from your writing, with sources.

> Sample data belongs to **Mei Lin Chua, a made-up person**. Swap in your own.

## Before Day 1 (pre-flight)

```bash
git clone <your copy of this repo> my-twin && cd my-twin
npm install
cp .env.example .env      # then add your keys
npm run check             # screenshot the all-green result and send it in
```

You need Node.js 20+, Git, Claude Code, Obsidian, a GitHub account, a Railway account,
an Anthropic API key and a Gemini API key. Set a monthly spend limit on both API accounts.

## The 3 days

| Day | You build | Commands |
|---|---|---|
| 1 (online) | Your vault: writing to linked notes | `npm run ingest:sample`, then your own: `npm run ingest` |
| 2 (online) | The Twin's brain: search, Ask my Twin, voice bot, tests | `npm run index`, `npm run ask -- "question"`, `npm run draft -- "topic"`, `npm test` |
| 3 (classroom) | The site, live on Railway, safe to share | `npm run dev`, then deploy |

Look for `DAY 1 TASK`, `DAY 2 TASK` and `DAY 3 TASK` comments in the code: those are the parts you build.

## Commands

| Command | What it does |
|---|---|
| `npm run check` | Checks your laptop, keys and packages |
| `npm run ingest:sample` | Builds a vault from the sample data |
| `npm run ingest` | Builds your vault from `raw-artifacts/` |
| `npm run index` | Builds the search index (`data/index.json`) |
| `npm run ask -- "..."` | Asks your Twin from the terminal |
| `npm run draft -- "..."` | Drafts a post in your voice into `drafts/` |
| `npm run dev` | Runs the site at http://localhost:3000 |
| `npm test` | Search quality, refusals, rate limits, privacy |

## Deploy to Railway (Day 3)

1. Commit and push: `git add -A && git commit -m "My Twin" && git push`
2. On railway.com: New Project > Deploy from GitHub repo > pick your repo.
3. Variables: add `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `TWIN_NAME`, `TWIN_HEADLINE`, `TWIN_LOCATION`.
4. Settings > Networking > Generate Domain. Open it on your phone.
5. Check `https://<your-domain>/health` shows `"ok": true`.

Keys live only in Railway Variables and your local `.env`. Never in the repo.

## Safety switches

- `RATE_LIMIT_PER_MINUTE` (default 6) per visitor, `DAILY_QUESTION_CAP` (default 150) for the whole site.
- `src/twin/guard.js` blocks off-limits topics before they reach the model.
- `src/twin/rules.md` tells the Twin to answer only from your notes and cite them.
- The site never holds LinkedIn Connections or anyone else's personal data.

---
Arters · arters.sg
