import askLLM from "../services/askLLM.js";
import { searchChunks } from "../services/search.service.js";
export default async function Chat(req, res) {
    const { question, docid } = req?.body;
    console.log("question, docid",question, docid)
    const chunks = await searchChunks(question, docid, 5);
        const context = chunks.map(c => `[Page ${c.page}] ${c.text}`).join("\n\n");
        console.log("question, context",question, context)
    const answer = await askLLM(question, context);                
    res.json({ answer, sources: chunks.map(c => c.page) });

}