"use client";

import { useEffect, useRef } from "react";
import useChatStore from "@/store/chat.store";
import usePdfStore from "@/store/pdf.store";
import ChatMessage from "./ChatMessage";

export default function ChatWindow() {
    const { messages, isLoading, error } = useChatStore();
    const { docId } = usePdfStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, error]);

    if (messages.length === 0 && !isLoading && !error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center mb-3">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M8 10h8M8 14h5m-9 6l2.3-3.45A8 8 0 1112 20H4z"
                        />
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                    {docId ? "Ask anything about your PDF" : "No document yet"}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    {docId
                        ? "Type your question below and get answers from the document."
                        : "Upload a PDF on the left to start chatting with it."}
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {messages.map((message) => (
                <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    time={message.time}
                />
            ))}

            {isLoading && (
                <div className="text-sm text-zinc-500">AI is thinking...</div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div ref={bottomRef} />
        </div>
    );
}
