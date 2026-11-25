import ioredis from "ioredis"
import dotenv from "dotenv"
dotenv.config()

const connection = new ioredis(
    process.env.REDIS_URL,
    {
        maxRetriesPerRequest: null,
    }
)

connection.on("connect", () => {
    console.log("Redis connected successfully");
});

connection.on("error", (error) => {
    console.error("Redis connection error:", error);
});

export default connection;