import { db } from "./db";

export async function buildContext(projectId: string, query: string): Promise<string> {
  const docs = await db.knowledgeDoc.findMany({
    where: { projectId },
    select: { title: true, content: true },
  });

  if (docs.length === 0) return "";

  // Simple keyword-based relevance scoring (no vector DB needed for MVP)
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  const scored = docs
    .map((doc) => {
      const text = `${doc.title} ${doc.content}`.toLowerCase();
      const score = queryWords.reduce(
        (acc, word) => acc + (text.includes(word) ? 1 : 0),
        0
      );
      return { doc, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) {
    // Return top 2 docs regardless when no keyword match
    return docs
      .slice(0, 2)
      .map((d) => `### ${d.title}\n${d.content}`)
      .join("\n\n");
  }

  return scored.map((s) => `### ${s.doc.title}\n${s.doc.content}`).join("\n\n");
}

export function chunkText(text: string, chunkSize = 1000): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
