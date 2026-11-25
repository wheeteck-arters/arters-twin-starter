// Split notes into passages the Twin can quote.
// DAY 2 TASK: tune size and overlap, then re-run your 10 test questions.
export const CHUNK_WORDS = 180;
export const OVERLAP_WORDS = 40;

export function chunkNote(note) {
  const words = note.body.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let start = 0; start < words.length; start += CHUNK_WORDS - OVERLAP_WORDS) {
    chunks.push(words.slice(start, start + CHUNK_WORDS).join(" "));
    if (start + CHUNK_WORDS >= words.length) break;
  }
  return chunks.map((text, i) => ({ id: `${note.slug}#${i}`, slug: note.slug, title: note.title, date: note.date || "", text: `${note.title}. ${text}` }));
}
