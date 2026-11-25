// HTML to plain text. Good enough for LinkedIn articles.
// DAY 1 TASK: blog exports (WordPress, Substack) have extra wrappers, footers and
// share buttons. Ask Claude Code to extend this so those come out clean.
export function htmlToText(html) {
  return html
    .replace(/<(script|style|nav|footer)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function parseHtmlFile(file, text) {
  // TODO (Day 1): pull the real title, date and body from your blog's HTML export.
  const title = text.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || file;
  return { title, type: "essay", source: "html", date: "", body: htmlToText(text) };
}
