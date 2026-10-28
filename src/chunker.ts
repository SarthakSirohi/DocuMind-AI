export interface TextChunk {
    text: string;
    pageNumber: number;
    chunkIndex: number;
}

export function chunkText(text: string, pageNumber: number, chunkSize: number = 1000, overlap: number = 200): TextChunk[] {
    const words = text.split(/\s+/);
    const chunks: TextChunk[] = [];

    let start = 0;
    let chunkIndex = 0;

    while(start < words.length){
        const end = Math.min(start + chunkSize, words.length)

        const chunk = words.slice(start, end).join(" ");

        chunks.push({
            text: chunk,
            pageNumber,
            chunkIndex
        })

        chunkIndex++;

        if(end == words.length){
            break;
        }

        start = end - overlap;
    }
    return chunks;
}