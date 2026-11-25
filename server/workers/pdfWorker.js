import { Worker } from "bullmq";
import connection from "../config/redis.js";
import { extractPDF } from "../services/pdf.service.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Index } from "@upstash/vector"
const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});
const worker = new Worker(
    "pdf-processing",
    async (job) => {
        const { filePath, originalName } = job.data;

        console.log(`Processing PDF: ${originalName}`);

        const documents = await extractPDF(filePath);

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 100 });
        const chunks = await splitter.splitDocuments(documents);
        console.log(`Created ${chunks.length} chunks`);

        // send chunks to Upstash in batches of 100
        const vectors = chunks.map((chunk, i) => ({
            id: `${job.id}-${i}`,
            data: chunk.pageContent,            // Upstash turns this text into a vector
            metadata: {
                docId: String(job.id),
                originalName,
                page: chunk.metadata.loc?.pageNumber,
                text: chunk.pageContent,        // saved so search results return the text
            },
        }));

        for (let i = 0; i < vectors.length; i += 100) {
            await index.upsert(vectors.slice(i, i + 100));
        }

        console.log(`Stored ${vectors.length} chunks in Upstash`);        
// each chunk keeps its page number in chunk.metadata.loc.pageNumber
        console.log("PDF extraction completed");

        return {
            filename: originalName,
            totalPages: documents.length,
            totalChunks: chunks.length,
        };
    },
    {
        connection,
        concurrency: 2,
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("PDF Worker is running...");