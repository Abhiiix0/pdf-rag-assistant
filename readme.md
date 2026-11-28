# PDF RAG Assistant

Upload a PDF and chat with it. It uses **hybrid search** (semantic + keyword) with **reranking**, detects the user's **intent**, and understands follow-up questions. The assistant is instructed to answer only from the document's content, and returns the pages used as context.

## Architecture

### Ingestion

```
 Client ── POST /upload ──► Express ──► multer saves PDF to disk
                               │
                               └──► BullMQ queue (Upstash Redis) ──► returns jobId
                                              │
                                              ▼
                               Worker (separate process)
                               PDFLoader → text per page
                               Split: 800 chars, 100 overlap
                                              │
                                              ▼
                               Upstash Vector (Hybrid index)
                               dense + BM25 sparse embeddings
```

### Question answering

```
 Client ── POST /chat { question, docid, chatHistory }
                               │
                               ▼
                 1. Intent detection + query rewrite (Groq)
                    ├─ greeting / thanks / acknowledgement / out_of_scope → fixed reply
                    ├─ summary → chunks from across the PDF → step 4
                    └─ document_question
                               │
                               ▼
                 2. Hybrid search, filtered by docId
                    ┌──────────────┴──────────────┐
              Semantic (dense)            Keyword (BM25 + IDF)
                    └──────────────┬──────────────┘
                        RRF fusion → up to 20 candidates
                               │
                               ▼
                 3. Rerank (Jina) → top 5 chunks
                               │
                               ▼
                 4. Answer (Groq), from that context only
                               │
                               ▼
                    { answer, sources: [pages] }
```

## How it works

1. **Upload:** `POST /upload` saves the file, adds a `process-pdf` job to the queue and returns a `jobId` straight away. This `jobId` is the document ID.
2. **Ingest:** the worker extracts the text with LangChain `PDFLoader` and splits it into chunks.
3. **Store:** each chunk is saved with its text, page number and `docId`. Upstash creates both the dense and sparse vectors from the raw text.
4. **Understand:** the client sends the last 3 messages. One LLM call detects the intent and rewrites a follow-up such as "how many can be carried forward?" into a complete question. If it fails, the message is treated as a document question, unchanged.
5. **Search:** semantic and keyword search run together, filtered to the current document, and return up to 20 candidates.
6. **Rerank:** a reranker compares the question with each candidate and keeps the best 5.
7. **Answer:** the rewritten question and those 5 chunks go to the LLM.

## Intent detection

| Intent              | Example                | What happens                          |
| ------------------- | ---------------------- | ------------------------------------- |
| `greeting`          | "hi"                   | Fixed reply, no search                |
| `thanks`            | "thanks", "bye", "great job" | Fixed reply, no search          |
| `acknowledgement`   | "ok", "got it"         | Fixed reply, no search                |
| `out_of_scope`      | "write me a poem"      | Polite refusal, no search             |
| `summary`           | "summarize this PDF"   | Up to 15 chunks from across the PDF   |
| `document_question` | "what is the notice period?" | Hybrid search and reranking     |

The classifier can't see the document, so when unsure it picks `document_question`. A summary of one topic is also treated as a document question. A message with praise or "ok" followed by a question is treated as a question.

To add an intent, update three places: the `INTENTS` list and the prompt in `intent.service.js`, and its handling in `Chat.js`.

For a PDF with more than 15 chunks, the summary uses evenly spaced chunks. It is an overview and can miss details.

Steps 5 and 6 above apply only to document questions.

## Hybrid search

| Part                   | What it is good at                                        |
| ---------------------- | --------------------------------------------------------- |
| Semantic (dense)       | Meaning: different wording for the same idea              |
| Keyword (BM25, sparse) | Exact terms: names, codes, numbers                        |
| IDF weighting          | Gives rare words more weight in keyword search            |
| RRF fusion             | Merges both lists by rank, since their scores don't match |

A chunk that ranks well in both lists moves up. An RRF score shows rank, not how relevant a chunk is, so it shouldn't be used as a similarity cutoff.

## Reranking

```
hybrid search → up to 20 candidates → Jina reranker → best 5 → LLM
```

Hybrid search finds likely chunks quickly, and RRF merges them by position only. The reranker (`jina-reranker-v3.5`) scores each candidate against the question, so the most relevant chunks move to the top.

- If the request fails or takes more than 5 seconds, the app uses the first 5 results in hybrid order, so chat keeps working. The server logs `Reranking failed`.
- A reranker can only reorder the candidates. It can't recover a chunk that search didn't return.
- Don't assume its scores run from 0 to 1; they can be negative.
- The question and candidate chunk text are sent to Jina. The question, chat history and selected chunks are also sent to Groq.

## Prompt injection protection

A PDF can contain text written to manipulate the AI, such as "ignore all previous instructions". The app reduces this risk:

- The answer prompt treats the document as untrusted data and tells the model not to follow instructions inside it.
- Document text is wrapped in `<document>` tags, and matching tags inside the text are removed.
- Images in AI replies aren't rendered, so a reply can't make the browser load an image from an outside server.

These measures lower the risk but don't guarantee protection. Links in replies are still shown, so check them before opening. The model has no tools or database access.

## Tech stack

| Layer        | Tools                                                                                |
| ------------ | ------------------------------------------------------------------------------------ |
| Client       | Next.js 16, React 19, TypeScript, Tailwind CSS, zustand, react-markdown              |
| Server       | Node.js (ESM), Express 5, multer                                                     |
| Queue        | BullMQ + ioredis on Upstash Redis                                                    |
| PDF / chunks | LangChain `PDFLoader`, `RecursiveCharacterTextSplitter`                              |
| Vector DB    | Upstash Vector hybrid index (`text-embedding-3-small` + BM25)                        |
| Reranker     | Jina `jina-reranker-v3.5`                                                            |
| LLM (Groq)   | `openai/gpt-oss-120b` for answers, `openai/gpt-oss-20b` for intent and query rewriting |

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
  services/       pdf.service.js, intent.service.js, search.service.js,
                  summary.service.js, rerank.service.js, askLLM.js
  queues/         pdfQueue.js
  workers/        pdfWorker.js
  config/         redis.js
```

## Getting started

You need Node.js 20+, and accounts on [Upstash](https://upstash.com) (Redis and Vector), [Groq](https://console.groq.com) and [Jina](https://jina.ai/reranker/). Check each provider's current limits and terms.

### 1. Create the vector index

In the Upstash console, create a Vector index with these settings:

| Setting      | Value                    |
| ------------ | ------------------------ |
| Type         | Hybrid                   |
| Dense model  | `text-embedding-3-small` |
| Dimensions   | 1536                     |
| Metric       | Cosine                   |
| Sparse model | BM25                     |

Choose Upstash embedding models for both, not "Custom", because the app sends raw text. A dense-only index won't work with this setup.

### 2. Server

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
JINA_API_KEY=
```

Use `rediss://` (with two s) because Upstash Redis requires TLS.

Run the API and the worker in two terminals:

```bash
npm run dev      # API on http://localhost:8000
npm run worker   # processes uploaded PDFs
```

Restart both after changing `.env`. The worker also doesn't hot-reload, so restart it after changing its code. If you switch to a new index, upload your PDFs again.

### 3. Client

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

### `POST /upload`

`multipart/form-data` with a `pdf` field (PDF only, max 10MB).

```json
202 { "success": true, "message": "...", "jobId": "21" }
```

### `POST /chat`

```json
{
    "question": "How many can be carried forward?",
    "docid": "21",
    "chatHistory": [
        { "role": "user", "content": "How many paid leaves does an employee get?" }
    ]
}
```

`chatHistory` is optional.

```json
200 { "intent": "document_question", "answer": "...", "sources": [1, 2] }
```

| Status | When                                                   |
| ------ | ------------------------------------------------------ |
| 400    | `question` is blank, or `docid` is missing or not numeric |
| 500    | Search or answer generation failed                     |

Indexing runs in the background. If you ask before it finishes, the answer may be incomplete or say that no content was found.

## Limitations

- Short replies depend on context. For example, "ok" accepting an offer from the assistant may be treated as an acknowledgement.
- Source page numbers are returned by the API but aren't shown in the chat UI yet.
- Retrieval and intent detection haven't been measured against a full set of test questions.
- There is no user authentication or ownership check. Anyone who can reach the API can query a document by its numeric ID.
- Chat and the uploaded document are kept in the browser's `sessionStorage`. They survive a refresh and are cleared when the tab is closed. Closing the tab doesn't delete the uploaded file or its vectors, and neither does the delete button.
