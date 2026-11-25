# PDF RAG Assistant: Server Context

Paste this whole file into ChatGPT as background before asking questions about the backend.

## 1. Project overview
- **Project:** PDF RAG Assistant. A user uploads a PDF, then chats with it (Retrieval-Augmented Generation).
- **Monorepo layout:** `client/` (Next.js frontend) and `server/` (Node.js + Express backend).
- **This file covers `server/` only.**
- **Current stage:** early setup. Only the PDF upload endpoint exists. There is no PDF parsing, chunking, embeddings, vector DB, queue worker or LLM call yet.

## 2. Tech stack
| Item | Detail |
|---|---|
| Runtime | Node.js 22, ES Modules (`import` / `export default`) |
| Framework | Express 5 (`express@^5.3.0`) |
| Upload handling | multer 2 (`diskStorage`) |
| CORS | `cors` (allows all origins right now) |
| Dev runner | nodemon (`npm run dev` runs `nodemon index.js`) |
| Installed, not used yet | `bullmq` + `ioredis` (job queue on Redis, planned for PDF processing), `dotenv` (env vars) |
| Accidental installs | `i` and `npm` are listed in dependencies, probably by mistake. They can be removed. |
| Port | `8000` (hardcoded in `index.js`) |

## 3. Folder structure
```
server/
├── index.js              # Entry point: starts the HTTP server on port 8000
├── app.js                # Creates the Express app, adds CORS, mounts routes
├── routes/
│   └── routes.js         # Route definitions + multer upload config
├── controller/
│   └── FileUpload.js     # Handler for POST /upload: validates and returns file info
├── uploads/              # Uploaded PDFs are saved here (gitignored, must exist on disk)
├── package.json          # Dependencies and the "dev" script
├── package-lock.json
├── .gitkeep              # Keeps the folder in git when otherwise empty
└── CONTEXT.md            # This file
```

## 4. What each file does
### `index.js`
Imports `app` from `app.js` and calls `app.listen(8000)`. It logs `Server started on port : 8000`.

### `app.js`
- Creates `const app = express()`.
- `app.use(cors())` allows every origin.
- `app.use("/", route)` mounts the router from `routes/routes.js` at the root.
- `GET /` is a health check that returns `200 { "message": "Ok" }`.
- `export default app`.

### `routes/routes.js`
- Configures multer with **disk storage**:
  - destination: `uploads/` (relative to where the server is started, so run it from `server/`)
  - filename: `<Date.now()>-<random number>-<originalname>`
- Limits and filter:
  - max file size is **10 MB**
  - only `application/pdf` is accepted. Any other type calls `cb(new Error("Only PDF files are allowed"))`.
- Defines the route `POST /upload` with `upload.single("pdf")`, then `FileUpload`.
- Default-exports the Express `Router`.

### `controller/FileUpload.js`
A plain handler `(req, res)`:
- If `req.file` is missing, it returns `400 { success: false, message: "Please upload a PDF file" }`.
- Otherwise it returns `200` with:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "filename": "1700000000000-123456789-report.pdf",
    "originalName": "report.pdf",
    "path": "uploads/1700000000000-123456789-report.pdf",
    "size": 123456,
    "mimetype": "application/pdf"
  }
}
```
It only reports the saved file. It does **not** parse or index the PDF yet.

## 5. API (current)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/` | none | `200 { "message": "Ok" }` |
| POST | `/upload` | `multipart/form-data`, file field name **`pdf`** | see above |

Example:
```bash
curl -F "pdf=@./sample.pdf" http://localhost:8000/upload
```

## 6. How to run
```bash
cd server
npm install
mkdir -p uploads        # multer does not create this folder
npm run dev             # nodemon index.js → http://localhost:8000
```

## 7. Known issues / gaps
1. **No `"type": "module"` in `package.json`.** The code uses ES `import` syntax. It only works because Node 22 auto-detects it. Add `"type": "module"` to be safe.
2. **Import paths need the `.js` extension** in ES modules (for example `../controller/FileUpload.js`). Leaving it out causes `ERR_MODULE_NOT_FOUND`.
3. **`uploads/` is not created automatically.** Uploads fail if it is missing.
4. **No error-handling middleware.** A rejected file (wrong type or too large) becomes a default Express 500 HTML error. It should return clean JSON with a 400 status.
5. **No `express.json()`**. Add it when JSON bodies are needed (for example the chat endpoint).
6. **Env config:** `dotenv` is installed but not loaded. Port, Redis URL and API keys should move to `.env` (gitignored, add a `.env.example`).
7. **`i` and `npm` in `dependencies`** are accidental and should be removed.
8. The frontend's upload component does not call this API yet (it only holds the file in browser state).

## 8. Planned RAG pipeline (not built yet)
1. `POST /upload` saves the PDF and adds a job to a **BullMQ** queue (Redis via `ioredis`).
2. A worker extracts the PDF text, splits it into chunks, creates embeddings and stores them in a vector DB.
3. `POST /chat` takes `{ question }`, retrieves the top-k similar chunks, sends them with the question to an LLM, and returns the answer with page citations.
4. The frontend shows the chat messages (a `ChatMessage` component with a sources/citations slot already exists in `client/`).

## 9. Conventions to keep
- ES Modules everywhere, with `export default` for the router and controllers.
- Folders: `routes/` for routing, `controller/` for request handlers. Add `services/` (PDF, embeddings, LLM), `queues/` and `workers/` as the pipeline grows.
- Keep secrets in `.env`. Never commit `.env` or `uploads/`.
