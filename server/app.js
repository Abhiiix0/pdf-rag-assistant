import express from "express"
import cors from "cors"
import route from "./routes/routes.js"
const app = express()
app.use(cors())
app.use(express.json())      // add this line

app.use("/",route)
app.get("/", (req, res) => {
    return res.status(200).json({
        message:"Ok"
    })
})

export default app