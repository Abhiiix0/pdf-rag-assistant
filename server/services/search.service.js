import { FusionAlgorithm, Index, WeightingStrategy } from "@upstash/vector";
const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

export async function searchChunks(question, docid, topK = 5) {
    const results = await index.query({
        data: question,
        topK,
        includeMetadata: true,
        fusionAlgorithm: FusionAlgorithm.RRF,       // already the default
        weightingStrategy: WeightingStrategy.IDF,
        filter: `docId = '${docid}'`,
    })
    return results.map((r) => ({
        score: r.score,                       // RRF fusion score, higher = better rank
        page: r.metadata.page,
        text: r.metadata.text,
        originalName: r.metadata.originalName,
    }))
}