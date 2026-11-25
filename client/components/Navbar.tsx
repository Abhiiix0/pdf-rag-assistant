export type MobileTab = "upload" | "chat";

type NavbarProps = {
    mobileTab: MobileTab;
    setMobileTab: (tab: MobileTab) => void;
};

export default function Navbar({ mobileTab, setMobileTab }: NavbarProps) {
    return (
        <header className="h-14 border-b border-zinc-200 bg-white/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
            <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <div>
                    <h1 className="font-semibold text-sm leading-tight text-zinc-900">
                        PDF Assistant
                    </h1>
                    <p className="text-[11px] text-zinc-500">
                        RAG Knowledge Base
                    </p>
                </div>
            </div>

            <div className="flex md:hidden bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                <button
                    onClick={() => setMobileTab("upload")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                        mobileTab === "upload"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-zinc-500 hover:text-black"
                    }`}
                >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                    <span>Document</span>
                </button>
                <button
                    onClick={() => setMobileTab("chat")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                        mobileTab === "chat"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-zinc-500 hover:text-black"
                    }`}
                >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <span>Chat</span>
                </button>
            </div>
        </header>
    );
}
