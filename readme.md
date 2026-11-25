**The Pdf Rag Assistant Flow is:**

- User uploads PDF.
- Express receives the PDF.
- BullMQ adds an upload job.
- Worker picks up the job.
- PDFLoader extracts text.
- Text gets converted into documents.
- OpenAI generates embeddings.
- Qdrant stores the embeddings.
- User asks a question.
- Qdrant retrieves relevant documents.
- GPT generates an answer.