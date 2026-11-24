import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF RAG Assistant",
  description: "Chat with your PDF documents",
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
