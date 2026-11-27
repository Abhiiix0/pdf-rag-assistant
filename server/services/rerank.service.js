const jinaUrl = "https://api.jina.ai/v1/rerank";

export default async function rerank(question, chunks, topN = 5) {
    try {
        const res = await fetch(jinaUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.JINA_API_KEY}`,
            },
            body: JSON.stringify({
                model: "jina-reranker-v3.5",
                query: question,
                documents: chunks.map((c) => c.text),
                top_n: topN,
            }),
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
            throw new Error(`Rerank error: ${res.status} ${await res.text()}`);
        }
        const { results } = await res.json();
        console.log(
            "reranked:",
            results.map((r) => `was #${r.index + 1} (${r.relevance_score.toFixed(3)})`)
        );
        return results.map((r) => chunks[r.index]);
    } catch (error) {
        console.error("Reranking failed:", error.message);
        return chunks.slice(0, topN);
    }
}