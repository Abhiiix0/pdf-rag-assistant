import { GoogleGenAI } from "@google/genai"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


export default async function askLLM(question, context) {
    const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Context from the PDF:\n${context}\n\nQuestion: ${question}`,
        config: {
            systemInstruction: 
                "You answer questions about a PDF. Use ONLY the context provided. " +
                "If the answer is not in the context, say you could not find it in the document. " +
                "Keep the answer short and clear.",
            
        }
    })
    return response.text;
}