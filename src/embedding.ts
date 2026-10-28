export async function createEmbedding(text: string): Promise<number[]> {
  const res = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
      prompt: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embedding failed: ${await res.text()}`);
  }

  const data = await res.json();
  return data.embedding;
}