import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const MarkdownText = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                strong: ({ children }) => (
                    <strong className="font-bold text-zinc-950">
                        {children}
                    </strong>
                ),
                p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-2 space-y-1">
                        {children}
                    </ol>
                ),
                h2: ({ children }) => (
                    <h2 className="text-base font-bold mb-2">{children}</h2>
                ),
                code: ({ children }) => (
                    <code className="bg-zinc-200 px-1 py-0.5 rounded text-xs">
                        {children}
                    </code>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownText;
