import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "PDF AI Assistant | Chat with Your Documents",
    description:
        "Upload PDF documents and get instant, AI-powered answers. Search, understand, and explore your documents through an intelligent chat assistant.",
};
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full bg-white antialiased">
            <body className="min-h-full flex flex-col font-sans bg-white text-black selection:bg-blue-600 selection:text-white">
                {children}
            </body>
        </html>
    );
}
