import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function extractPDF(filePath) {
    const loader = new PDFLoader(filePath);
    const documents = await loader.load();
    console.log("Total pages:", documents.length);

    return documents;
}