import { Queue } from "bullmq"
import connection from "../config/redis.js"

const pdfqueue = new Queue("pdf-processing", {
    connection,
    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 2000,
        },

        removeOnComplete: {
            count: 100,
        },

        removeOnFail: {
            count: 500,
        },
    },
})

export default pdfqueue