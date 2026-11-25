"use client";
import type { MobileTab } from "./Navbar";
import ChatInput from "./ChatInput";
import usePdfStore from "@/store/pdf.store";
import ChatWindow from "./ChatWindow";



type ChatProps = {
    mobileTab: MobileTab;
};

export default function Chat({ mobileTab}: ChatProps) {
    const {pdfName}= usePdfStore()
    return (
            <main
                className={`flex-1 flex flex-col h-full min-w-0 bg-white ${mobileTab === "chat" ? "flex" : "hidden md:flex"
                    }`}
            >
                <div className="h-12 border-b border-zinc-200 bg-zinc-50/70 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="text-xs font-medium text-zinc-800 truncate">
                           {pdfName ? pdfName : "File Name"}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
                   <ChatWindow/>
                </div>

                {/* Bottom Chat Input Bar */}
                <ChatInput />
            </main>
    );
}
