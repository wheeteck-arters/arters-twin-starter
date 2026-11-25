# CLAUDE.md (example: on Day 1 you rewrite this for yourself)

Claude Code reads this file at the start of every session. Keep it short and true.

## What this repo is
My Digital Twin: my own writing as an Obsidian vault (`vault/notes`), a search index over it
(`data/index.json`), an "Ask my Twin" bot that answers only from my notes, a voice bot that drafts
posts in my style, and a small personal site deployed on Railway.

## Stack
- Node.js 20+, plain JavaScript (ES modules), Express. No build step, no TypeScript, no framework.
- Claude (Anthropic API) writes answers and drafts. Gemini makes embeddings and topic tags.
- Tests: `node --test` (built in). Run `npm test` after every change.

## Folder layout
- `src/ingest/` parsers: LinkedIn, Markdown, HTML, PDF -> notes. `note.js` owns the note format.
- `src/search/` chunking, embeddings, search.
- `src/twin/` the Twin: `rules.md` (what it may say), `guard.js` (blocked topics), `ask.js`.
- `src/voice/` the voice bot. `src/site/` page templates and safety limits. `src/server.js` routes.
- `vault/` my notes (committed). `raw-artifacts/` my raw files (never committed).

## Rules for Claude
- Small changes, one at a time. Explain what you changed and why.
- Never commit `.env`, API keys, or anything in `raw-artifacts/`.
- Never read or import LinkedIn `Connections.csv` or any other people's personal data.
- Never publish or post anything. Drafts go to `drafts/` for me to approve.
- Keep dependencies few. Ask before adding a package.
- When you change search or the Twin, run `npm test` and show me the result.
