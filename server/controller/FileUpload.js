import pdfQueue from "../queues/pdfQueue.js"

export default async function FileUpload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF",
            });
        }

        const job = await pdfQueue.add("process-pdf", {
            filePath: req.file.path,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
        });

        return res.status(202).json({
            success: true,
            message: "PDF uploaded successfully. Processing started.",
            jobId: job.id,
        });

    } catch (error) {
        console.error("Upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload PDF",
        });
    }
}