"use client";

import useChatStore from "@/store/chat.store";
import ChatMessage from "./ChatMessage";

export default function ChatWindow() {
    const { messages, isLoading, error } = useChatStore();

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
                <div className="text-sm text-zinc-500">
                    AI is thinking...
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

        </div>
    );
}