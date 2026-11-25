"use client";

import React, { useState } from "react";
import usePdfStore from "@/store/pdf.store";
import useChatStore from "@/store/chat.store";

export default function ChatInput() {
    const [value, setValue] = useState("");

    const { docId } = usePdfStore();

    const {
        addMessage,
        setLoading,
        setError,
        isLoading,
    } = useChatStore();

    const hasText = value.trim().length > 0;

    async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const question = value.trim();

        if (!question || !docId || isLoading) return;

        // Add user message
        addMessage({
            id: crypto.randomUUID(),
            role: "user",
            content: question,
        });

        setValue("");
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    docid:docId,
                    question,
                }),
            });

            const data = await res.json();
console.log("response data: ",data)
            if (!res.ok) {
                throw new Error(data.message || "Failed to get response");
            }

            // Add AI response
            addMessage({
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.answer,
                sources: data.sources,
            });

        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Something went wrong";

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-3 md:p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 shrink-0">
            <div className="max-w-3xl mx-auto">
                <form
                    onSubmit={sendMessage}
                    className="relative flex items-center bg-zinc-100 rounded-2xl border border-zinc-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-1.5"
                >
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={
                            docId
                                ? "Ask any question about your PDF..."
                                : "Upload a PDF first..."
                        }
                        disabled={!docId || isLoading}
                        className="flex-1 bg-transparent border-0 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-hidden disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={!hasText || !docId || isLoading}
                        className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Send message"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${hasText ? "rotate-90" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}