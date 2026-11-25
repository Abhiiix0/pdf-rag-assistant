# PDF RAG Assistant

Upload a PDF and chat with it. Answers are generated only from the document's content, with the source page numbers returned alongside.

## Architecture

```
                         ┌───────────────────────────┐
                         │   Next.js client (3000)   │
                         │  Upload panel + Chat UI   │
                         │   zustand (sessionStorage)│
                         └─────────────┬─────────────┘
                                       │ REST
                         ┌─────────────▼─────────────┐
                         │    Express server (8000)  │
                         │   POST /upload  POST /chat│
                         └───────┬───────────┬───────┘
                                 │           │
              ── Ingestion ──    │           │    ── Question answering ──
                                 │           │
        ┌────────────────────────▼──┐     ┌──▼─────────────────────────┐
        │ multer saves PDF to disk  │     │ 1. Vector search (top 5)   │
        │ BullMQ job → Upstash Redis│     │    filtered by docId       │
        └────────────┬──────────────┘     │ 2. Build context from chunks│
                     │                    │ 3. Groq LLM answers from   │
        ┌────────────▼──────────────┐     │    context only            │
        │ Worker (separate process) │     └──────────────▲─────────────┘
        │ PDFLoader → text          │                    │
        │ Split: 800 chars / 100 ov.│                    │ query
        │ Upsert chunks + metadata  ├────────────────────┘
        └────────────┬──────────────┘          ┌─────────┴──────────┐
                     └────────────────────────►│   Upstash Vector   │
                                               │ (built-in embeds)  │
                                               └────────────────────┘
```

### Flow

1. **Upload:** the client sends the PDF to `POST /upload`. The server stores it and adds a `process-pdf` job to a BullMQ queue, then returns a `jobId` straight away. This `jobId` is the document ID.
2. **Ingest:** a separate worker picks up the job, extracts the text per page with LangChain `PDFLoader`, and splits it into chunks (800 characters, 100 overlap).
3. **Store:** each chunk is upserted into Upstash Vector with its text, page number and `docId`. Upstash creates the embeddings itself, so no separate embedding API key is needed.
4. **Ask:** `POST /chat` takes `{ question, docid }`. It finds the 5 closest chunks for that document, builds a context from them, and asks the LLM to answer using only that context.
5. **Answer:** the response is `{ answer, sources }`, where `sources` are the page numbers used.

## Tech stack

| Layer        | Tools                                                       |
| ------------ | ----------------------------------------------------------- |
| Client       | Next.js 16, React 19, TypeScript, Tailwind CSS, zustand     |
| Server       | Node.js (ESM), Express 5, multer                            |
| Queue        | BullMQ + ioredis on Upstash Redis                           |
| PDF / chunks | LangChain `PDFLoader`, `RecursiveCharacterTextSplitter`     |
| Vector DB    | Upstash Vector (built-in embedding model)                   |
| LLM          | Groq (`openai/gpt-oss-120b`), Gemini code kept as an option |

## Project structure

```
client/
  app/            Next.js app router
  components/     Navbar, Upload, Chat, ChatWindow, ChatMessage, ChatInput, MarkdownText
  store/          pdf.store.ts, chat.store.ts (persisted in sessionStorage)
server/
  index.js, app.js
  routes/         /upload and /chat routes (multer config)
  controller/     FileUpload.js, Chat.js
  services/       pdf.service.js, search.service.js, askLLM.js
  queues/         pdfQueue.js
  workers/        pdfWorker.js
  config/         redis.js
```

## Getting started

You need Node.js 20+ and free accounts on [Upstash](https://upstash.com) (Redis and Vector, with a built-in embedding model) and [Groq](https://console.groq.com).

### 1. Server

```bash
cd server
npm install --legacy-peer-deps
mkdir -p uploads
```

Create `server/.env`:

```env
REDIS_URL=rediss://default:<password>@<host>:6379
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
GROQ_API_KEY=
```

Use `rediss://` (with two s) because Upstash requires TLS.

Run the API and the worker in two terminals:

```bash
npm run dev      # API on http://localhost:8000
npm run worker   # processes uploaded PDFs
```

The worker is a separate process and does not hot-reload, so restart it after changing its code.

### 2. Client

```bash
cd client
npm install
```

Create `client/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev      # http://localhost:3000
```

## API

| Method | Endpoint  | Body                                     | Response                                 |
| ------ | --------- | ---------------------------------------- | ---------------------------------------- |
| POST   | `/upload` | `multipart/form-data`, field `pdf` (PDF, max 10MB) | `202 { success, message, jobId }` |
| POST   | `/chat`   | `{ "question": "...", "docid": "<jobId>" }` | `{ answer, sources: [pages] }`        |

Indexing runs in the background, so wait a few seconds after uploading before asking the first question.

## Notes

- Chat and the uploaded document persist across a page refresh and are cleared when the tab is closed.
- Answers are limited to the document. If the answer is not in the retrieved context, the assistant says it could not find it.
