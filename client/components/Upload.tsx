"use client";
import { useState } from "react";
import type { MobileTab } from "./Navbar";
import usePdfStore from "@/store/pdf.store";

type UploadProps = {
    mobileTab: MobileTab;
    setMobileTab: (tab: MobileTab) => void;
};

const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function Upload({
    mobileTab,
    setMobileTab,
}: UploadProps) {

    const [file, setFile] = useState<File | null>(null);
    const { setDocId,setPdfName,setPdf,resetPdf,pdfName,docId} = usePdfStore()
   console.log("pdf", file)
async function uploadFun() {
    if (!file) {
        console.log("Please select a PDF");
        return;
    }

    const formdata = new FormData();
    formdata.append("pdf", file);

    try {
        console.log("API started");

        const res = await fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formdata,
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Upload failed");
        }

        console.log("File uploaded:", data);
        setDocId(data.jobId)
        setPdfName(file.name);
        setPdf(file);
    } catch (error) {
        console.error("Upload error:", error);
    }
}
    return (
            <aside
                className={`w-full md:w-[380px] lg:w-[420px] shrink-0 border-r border-zinc-200 bg-zinc-50 flex flex-col h-full overflow-y-auto ${mobileTab === "upload" ? "flex" : "hidden md:flex"
                    }`}
            >
                <div className="p-5 flex flex-col gap-5">
                {/* Panel Title */}
                {
                    docId && pdfName &&
                
                    <div>
                        <h2 className="text-base font-semibold text-zinc-900">
                            PDF Upload
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Upload your document to chat and query its content.
                        </p>
                    </div>
}
  {!file && (
                    <div className="group relative border-2 border-dashed border-zinc-200 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-zinc-50 hover:bg-blue-50 transition-all cursor-pointer">
                        <input
                            
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setFile(f);
                                e.target.value = "";
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
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
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-zinc-900">
                            <span className="text-blue-600 underline decoration-blue-500">
                                Click to browse
                            </span>{" "}
                            or drag & drop
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            PDF files up to 25MB
                        </p>
                    </div>
                    )}
{file && (
    <button
        onClick={uploadFun}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
        Upload PDF
    </button>
)}
                    {/* Uploaded Document Card */}
                    {file && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Uploaded Document
                            </span>
                        </div>

                        <div className="border border-zinc-200 rounded-xl p-3.5 bg-zinc-50 flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
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
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs font-semibold text-zinc-900 truncate">
                                        {file.name}
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null)
                                        resetPdf()
                                    }}
                                    className="text-zinc-500 hover:text-black p-1 rounded-md hover:bg-zinc-100 transition-colors"
                                    title="Remove file"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full w-full rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    )}

                    <div className="md:hidden mt-auto pt-2">
                        <button
                            type="button"
                            onClick={() => setMobileTab("chat")}
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/30 transition-colors"
                        >
                            <span>Continue to Chat Screen</span>
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
    );
}
