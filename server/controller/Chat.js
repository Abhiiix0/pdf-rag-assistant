import askLLM from "../services/askLLM.js";
import queryRewrite from "../services/queryRewrite.js";
import { searchChunks } from "../services/search.service.js";
import rerank from "../services/rerank.service.js";
export default async function Chat(req, res) {
    const { question, docid, chatHistory } = req.body ?? {};

    if (typeof question !== "string" || !question.trim() || !/^\d+$/.test(String(docid))) {
        return res.status(400).json({
            message: "A question and a valid docid are required",
        });
    }

    try {
        const { rewrittenQuery } = await queryRewrite(
            question,
            Array.isArray(chatHistory) ? chatHistory : []
        );
        const searchQuery = rewrittenQuery || question;
        console.log("searchQuery:", searchQuery);

        const candidates = await searchChunks(searchQuery, docid, 20);
        const chunks = candidates.length
    ? await rerank(searchQuery, candidates, 5)
    : [];
        if (!chunks.length) {
            return res.json({
                answer: "I couldn't find any content for this document. It may still be processing, so try again in a few seconds.",
                sources: [],
            });
        }

        const context = chunks.map((c) => `[Page ${c.page}] ${c.text}`).join("\n\n");
        const answer = await askLLM(searchQuery, context);

        res.json({ answer, sources: chunks.map((c) => c.page) });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ message: "Failed to get an answer. Please try again." });
    }
}
