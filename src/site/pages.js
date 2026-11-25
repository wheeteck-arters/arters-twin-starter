// Page templates. DAY 3 TASK: make the site yours (colours, words, layout).
import { marked } from "marked";
import { config } from "../config.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function layout(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><link rel="stylesheet" href="/style.css"></head>
<body><header class="top"><a href="/" class="brand">${esc(config.name)}</a>
<nav><a href="/#posts">Writing</a><a href="/#ask">Ask my Twin</a><a href="/privacy">Privacy</a></nav></header>
<main>${body}</main>
<footer>Built with my Digital Twin · <a href="/privacy">How this site uses data</a></footer>
<script src="/app.js" defer></script></body></html>`;
}

export function homePage(notes, about) {
  const posts = notes.filter((n) => n.type !== "profile")
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((n) => `<li><a href="/posts/${esc(n.slug)}">${esc(n.title)}</a>
      <span class="meta">${esc(n.date || "")}${n.topics?.length ? " · " + n.topics.slice(0, 3).map(esc).join(", ") : ""}</span>
      ${n.summary ? `<p>${esc(n.summary)}</p>` : ""}</li>`).join("");
  return layout(config.name, `
<section class="hero"><h1>${esc(config.name)}</h1><p class="headline">${esc(config.headline)}</p>
${config.location ? `<p class="meta">${esc(config.location)}</p>` : ""}
${about ? `<div class="about">${marked.parse(about)}</div>` : ""}</section>
<section id="ask" class="ask"><h2>Ask my Twin</h2>
<p class="meta">An AI that answers only from what I've written, with links to the source. It can be wrong, so check the source.</p>
<form id="ask-form"><input id="q" name="q" maxlength="500" placeholder="What do you think about code reviews?" required>
<button type="submit">Ask</button></form><div id="answer" aria-live="polite"></div></section>
<section id="posts"><h2>Writing</h2><ul class="posts">${posts || "<li>No notes yet. Run npm run ingest.</li>"}</ul></section>`);
}

export function postPage(note) {
  return layout(note.title, `<article><p class="meta"><a href="/#posts">&larr; All writing</a></p>
<h1>${esc(note.title)}</h1><p class="meta">${esc(note.date || "")}</p>${marked.parse(note.body.replace(/\[\[([^\]]+)\]\]/g, "[$1](/posts/$1)"))}</article>`);
}

export function privacyPage() {
  return layout("Privacy", `<article><h1>How this site uses data</h1>
<p>This site holds only things ${esc(config.name)} chose to publish: their own posts and articles.
It holds no data about their LinkedIn connections or anyone else.</p>
<p>When you ask the Twin a question, your question is sent to an AI service (Anthropic's Claude) to write the answer.
The site keeps a count of questions per day to cap costs. It does not store your question or your IP address after the day ends.</p>
<p>Don't put personal or confidential information in your questions.</p></article>`);
}

export function notFound() { return layout("Not found", "<h1>Not found</h1><p><a href='/'>Home</a></p>"); }
