const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

const INTENTS = ["greeting", "thanks", "summary", "acknowledgement" ,"document_question", "out_of_scope"];

const systemPrompt = `
You analyze messages sent to a PDF chat assistant. Do two things.

1. Pick one intent:
- "greeting": only a greeting.
- "thanks": only thanks, goodbye, or praise for the assistant or its answer
  ("great job", "nice answer", "i like it").
- "summary": asks for a summary or overview of the WHOLE document.
- "out_of_scope": clearly a task unrelated to reading the document,
  such as writing code or a poem.
- "acknowledgement": only a confirmation such as "ok", "got it", "understood"
  or "alright", with no question, request or thanks.
- "document_question": everything else.

Rules:
- You cannot see the document. If unsure, choose "document_question".
- A summary of one topic ("summarize the leave policy") is "document_question".
- A greeting followed by a question is "document_question".
- An acknowledgement followed by a question is "document_question".
- "ok thanks" is "thanks".
- If the last assistant message offered something or asked a question, then
  "yes", "sure" or "ok" accepts it. This is "document_question", not
  "acknowledgement".

2. Using the chat history, rewrite the message so it makes sense on its own.
If it already does, return it unchanged. Do not answer it.

Return JSON only:
{ "intent": string, "rewrittenQuery": string }
`;

export default async function detectIntent(question, history = []) {
    const fallback = { intent: "document_question", rewrittenQuery: question };

    try {
        const res = await fetch(groqUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                temperature: 0,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: JSON.stringify({
                            chatHistory: history.map((m) => ({
                                role: m?.role,
                                content: m?.content,
                            })),
                            question,
                        }),
                    },
                ],
            }),
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            throw new Error(`Groq API error: ${res.status}`);
        }

        const data = await res.json();
        const result = JSON.parse(data.choices[0].message.content);

        return {
            intent: INTENTS.includes(result.intent) ? result.intent : fallback.intent,
            rewrittenQuery: result.rewrittenQuery || question,
        };
    } catch (error) {
        console.error("Intent detection failed:", error.message);
        return fallback;
    }
}
