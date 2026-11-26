const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

export default async function queryRewrite(question, recentHistory = []) {
    if (!recentHistory.length) {
        return {
            needsRewriting: false,
            rewrittenQuery: question,
        };
    }
console.log("question 1", question)
    try {
        const res = await fetch(groqUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                temperature: 0.2,
                messages: [
                    {
                        role: "system",
                        content: `
                            You are a query rewriting assistant.

                            Analyze the current question using chat history.

                            Rules:
                            1. If the question is standalone, return it unchanged.
                            2. If it depends on previous conversation,
                               rewrite it into a standalone question.
                            3. Never change the user's original intention.
                            4. Do not answer the question.

                            Return JSON only:
                            {
                                "needsRewriting": boolean,
                                "rewrittenQuery": string
                            }
                        `,
                    },
                    {
                        role: "user",
                        content: JSON.stringify({
                            chatHistory: recentHistory,
                            question,
                        }),
                    },
                ],
                response_format: {
                    type: "json_object",
                },
            }),
        });

        if (!res.ok) {
            throw new Error(`Groq API error: ${res.status}`);
        }

        const data = await res.json();

        const result = JSON.parse(
            data.choices[0].message.content
        );
console.log("result", result)
        return result;

    } catch (error) {
        console.error("Query rewriting failed:", error);

        return {
            needsRewriting: false,
            rewrittenQuery: question,
        };
    }
}