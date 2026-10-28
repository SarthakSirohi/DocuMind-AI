import { connectDatabase } from "./mongoDB";

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) {
        return 0;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        const ai = a[i] ?? 0;
        const bi = b[i] ?? 0;

        dot += ai * bi;
        normA += ai * ai;
        normB += bi * bi;
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function retrieve(
    queryEmbedding: number[],
    topK: number
) {
    const client = await connectDatabase();

    try {
        const dbName = process.env.MONGODB_DATABASE ?? process.env.MONGO_DATABASE ?? "documind";
        const db = client.db(dbName);
        const collection = db.collection("documents");

        const documents = await collection.find({ embedding: { $exists: true } }).toArray();

        const scored = documents
            .map((doc) => {
                const embedding = Array.isArray(doc.embedding) ? doc.embedding : [];
                const score = cosineSimilarity(queryEmbedding, embedding);

                return {
                    text: doc.text,
                    source: doc.source,
                    pageNumber: doc.pageNumber,
                    chunkIndex: doc.chunkIndex,
                    score
                };
            })
            .filter((doc) => Number.isFinite(doc.score))
            .sort((a, b) => b.score - a.score);

        const seenChunks = new Set<string>();
        const uniqueScored = scored.filter((doc) => {
            const key = `${doc.source}:${doc.pageNumber}:${doc.chunkIndex}`;
            if (seenChunks.has(key)) {
                return false;
            }
            seenChunks.add(key);
            return true;
        });

        return uniqueScored.slice(0, topK);
    } finally {
        await client.close();
    }
}