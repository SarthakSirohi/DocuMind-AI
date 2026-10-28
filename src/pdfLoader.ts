import fs from "fs/promises"
import { PDFParse } from "pdf-parse"

export interface PdfPage{
    pageNumber: number,
    text: string
}

export async function loadPdf(filePath: string): Promise<PdfPage[]> {
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({
        data: buffer
    });

    const result = await parser.getText();
    await parser.destroy
    
    const pages: PdfPage[] = [];

    for(let i = 0; i < result.pages.length; i++){
        const page = result.pages[i];

        if(!page){
            continue;
        }
        pages.push({
            pageNumber: i + 1,
            text: page.text ?? ""
        });
    }
    return pages;
}