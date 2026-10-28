import "dotenv/config";

import readline from "readline";

import { createEmbedding } from "./embedding";
import { retrieve } from "./retriever";
import { generateAnswer } from "./llm";


async function main() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question: string = await new Promise((resolve) => {

        rl.question(
            "Ask a question: ",
            (answer) => {
                resolve(answer);
            }
        );

    });

    rl.close();


    console.log(
        `\nQuestion: ${question}\n`
    );


    const queryEmbedding =
        await createEmbedding(question);


    const results =
        await retrieve(
            queryEmbedding,
            5
        );


    const context =
        results
            .map(result => {

                return `
[Source: ${result.source}, Page: ${result.pageNumber}]

${result.text}
`;
            })
            .join("\n");


    console.log("Generating answer with Ollama...");

    const answer =
        await generateAnswer(
            question,
            context
        );


    console.log(
        "\nFinal Answer:\n"
    );

    console.log(answer);
}


main();