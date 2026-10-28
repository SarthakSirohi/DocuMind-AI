export async function generateAnswer(question: string, context: string): Promise<string> {
  const prompt = `You are a helpful assistant answering questions

about documents.

Use ONLY the provided context.

Do not invent facts.

If the context does not contain enough information,
say that you don't have enough information.

When you make a factual claim, cite the source
using this format:

[Source: filename, Page: X]

Context:

${context}

Question:

${question}

Answer:
`;

  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: process.env.OLLAMA_CHAT_MODEL || "llama3.2:latest",
      messages: [
        { role: "user", content: prompt }
      ],
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama chat failed: ${await res.text()}`);
  }

  const data = await res.json();
  return data.message?.content || "";
}