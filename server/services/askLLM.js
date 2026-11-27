import { GoogleGenAI } from "@google/genai"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// export default async function askLLM(question, context) {
//     const response = await ai.models.generateContent({
//         model: "gemini-3.8-flash",
//         contents: `Context from the PDF:\n${context}\n\nQuestion: ${question}`,
//         config: {
//             systemInstruction: 
//                 "You answer questions about a PDF. Use ONLY the context provided. " +
//                 "If the answer is not in the context, say you could not find it in the document. " +
//                 "Keep the answer short and clear.",
            
//         }
//     })
//     return response.text;
// }

const groqUrl = "https://api.groq.com/openai/v1/chat/completions"
export default async function askLLM(question, context) {
        const res = await fetch(groqUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model:"openai/gpt-oss-120b",
                    temperature: 0.2,
                    messages: [
                        {
                            role: "system",
                            content:
                                "You answer questions about a PDF. Use ONLY the context provided. " +
                                "If the answer is not in the context, say you could not find it in the document. " +
                                "Keep the answer short and clear.",
                        },
                        {
                            role: "user",
                            content: `Context from the PDF:\n${context}\n\nQuestion: ${question}`,
                        },
                    ],
                }),
            });
        if (!res.ok) {
            throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
        }
        const data = await res.json();
        return data.choices[0].message.content;
    
}