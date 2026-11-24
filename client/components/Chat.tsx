"use client";
import type { MobileTab } from "./Navbar";
import ChatInput from "./ChatInput";
import ChatMessage, { type ChatMessageData } from "./ChatMessage";

const sampleMessages: ChatMessageData[] = [
    {
        id: "welcome",
        role: "assistant",
        content: (
            <p>
                Hello! I&apos;ve analyzed{" "}
                <span className="font-semibold text-blue-600">
                    q3_financial_report_2024.pdf
                </span>
                . What would you like to know? You can ask for key metrics,
                summaries, or specific tables.
            </p>
        ),
    },
    {
        id: "q1",
        role: "user",
        content: (
            <p>What were the total quarterly revenues and operating margins?</p>
        ),
        time: "10:32 AM",
    },
    {
        id: "a1",
        role: "assistant",
        content: (
            <>
                <p className="font-medium text-zinc-900 mb-2">
                    According to Section 3.1 (Consolidated Statements):
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-zinc-700">
                    <li>
                        <strong className="text-zinc-900">Total Revenue:</strong> $14.2B,
                        representing a 12% year-over-year increase.
                    </li>
                    <li>
                        <strong className="text-zinc-900">Operating Margin:</strong> 28.4%,
                        compared to 26.1% in Q3 of the prior fiscal year.
                    </li>
                </ul>
            </>
        ),
    },
];

type ChatProps = {
    mobileTab: MobileTab;
    messages?: ChatMessageData[];
};

export default function Chat({ mobileTab, messages = sampleMessages }: ChatProps) {
    return (
            <main
                className={`flex-1 flex flex-col h-full min-w-0 bg-white ${mobileTab === "chat" ? "flex" : "hidden md:flex"
                    }`}
            >
                <div className="h-12 border-b border-zinc-200 bg-zinc-50/70 px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="text-xs font-medium text-zinc-800 truncate">
                            q3_financial_report_2024.pdf
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
                    {messages.map((m) => (
                        <ChatMessage
                            key={m.id}
                            role={m.role}
                            content={m.content}
                            time={m.time}
                        />
                    ))}
                </div>

                {/* Bottom Chat Input Bar */}
                <ChatInput />
            </main>
    );
}
