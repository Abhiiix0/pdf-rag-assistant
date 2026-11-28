import askLLM from "../services/askLLM.js";
import detectIntent from "../services/intent.service.js";
import { searchChunks } from "../services/search.service.js";
import { getSummaryChunks } from "../services/summary.service.js";
import rerank from "../services/rerank.service.js";

const FIXED_REPLIES = {
    greeting: "Hi! Ask me anything about your document, or ask for a summary.",
    thanks: "You're welcome! Ask me if you have more questions about the document.",
    out_of_scope: "I can only help with your uploaded document. Try asking about its content.",
    acknowledgement: "Alright! Ask me another question about the document whenever you're ready.",
};

export default async function Chat(req, res) {
    const { question, docid, chatHistory } = req.body ?? {};

    if (typeof question !== "string" || !question.trim() || !/^\d+$/.test(String(docid))) {
        return res.status(400).json({
            message: "A question and a valid docid are required",
        });
    }

    try {
        const { intent, rewrittenQuery } = await detectIntent(
            question,
            Array.isArray(chatHistory) ? chatHistory : []
        );
        console.log("intent:", intent, "| query:", rewrittenQuery);

        if (Object.hasOwn(FIXED_REPLIES, intent)) {
            return res.json({ intent, answer: FIXED_REPLIES[intent], sources: [] });
        }

        let chunks;
        if (intent === "summary") {
            chunks = await getSummaryChunks(docid);
        } else {
            const candidates = await searchChunks(rewrittenQuery, docid, 20);
            chunks = candidates.length
                ? await rerank(rewrittenQuery, candidates, 5)
                : [];
        }

        if (!chunks.length) {
            return res.json({
                intent,
                answer: "I couldn't find any content for this document. It may still be processing, so try again in a few seconds.",
                sources: [],
            });
        }

        const context = chunks.map((c) => `[Page ${c.page}] ${c.text}`).join("\n\n");
        const answer = await askLLM(rewrittenQuery, context);

        res.json({ intent, answer, sources: [...new Set(chunks.map((c) => c.page))] });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ message: "Failed to get an answer. Please try again." });
    }
}
