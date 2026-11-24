"use client";

import React, { useState } from "react";

export default function ChatInput() {
    const [value, setValue] = useState("");
    const hasText = value.trim().length > 0;

    return (
        <div className="p-3 md:p-4 bg-white/90 backdrop-blur-md border-t border-zinc-200 shrink-0">
            <div className="max-w-3xl mx-auto">
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="relative flex items-center bg-zinc-100 rounded-2xl border border-zinc-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-1.5"
                >
                    {/* Question Input Field */}
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Ask any question about your PDF..."
                        className="flex-1 bg-transparent border-0 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-hidden"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 shrink-0"
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
