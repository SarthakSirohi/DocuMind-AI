import path from "path"

import "dotenv/config"

import { connectDatabase } from "./mongoDB"
import { createEmbedding } from "./embedding"
import { loadPdf } from "./pdfLoader"
import { chunkText } from "./chunker"


async function main() {
    const client = await connectDatabase();

    const db = client.db(
        process.env.MONGODB_DATABASE ?? "documind"
    );

    const collection = db.collection("documents");

    const filePath = path.join(process.cwd(), "documents", "cricket_4_page.pdf");
    const source = path.basename(filePath);
    
    console.log("Reading PDF..")
    
    const pages = await loadPdf(filePath)

    console.log(`Found ${pages.length} pages`)

    let totalChunks = 0;

    for(const page of pages){
        console.log(`Processing page ${page.pageNumber}`);

        const chunks = chunkText(page.text, page.pageNumber, 1000, 200);

        for(const chunk of chunks){
            console.log(`Embedding chunk ${chunk.chunkIndex}`);

            const embedding = await createEmbedding(chunk.text);

            await collection.updateOne(
                {
                    source,
                    pageNumber: chunk.pageNumber,
                    chunkIndex: chunk.chunkIndex
                },
                {
                    $set: {
                        text: chunk.text,
                        embedding
                    }
                },
                { upsert: true }
            );

            totalChunks++;
        }
    }

    console.log(`Upserted ${totalChunks} chunks`);

    await client.close();
}

main();