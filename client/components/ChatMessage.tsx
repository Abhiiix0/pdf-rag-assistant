"use client";
import type { ChatMessageData } from "@/store/chat.store";
import MarkdownText from "./MarkdownText";

type ChatMessageProps = Omit<ChatMessageData, "id">;
export type ChatRole = "user" | "assistant";

export default function ChatMessage({ role, content, time }: ChatMessageProps) {
    if (role === "user") {
        return (
            <div className="flex items-start gap-3 max-w-2xl ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    U
                </div>
                <div className="flex-1 text-right">
                    <div className="inline-block text-left rounded-2xl rounded-tr-sm p-3.5 bg-blue-600 text-white text-sm leading-relaxed shadow-md shadow-blue-600/20">
                        <MarkdownText content={content} />
                    </div>
                    {time && (
                        <span className="block text-[10px] text-zinc-500 mt-1">
                            {time}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/25 text-xs font-semibold">
                AI
            </div>
            <div className="flex-1">
                <div className="rounded-2xl rounded-tl-sm p-4 bg-zinc-100 border border-zinc-200 shadow-xs text-sm text-zinc-900 leading-relaxed">
                    <MarkdownText content={content} />
                </div>
            </div>
        </div>
    );
}
