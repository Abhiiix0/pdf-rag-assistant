import { Router } from "express"
import FileUpload from "../controller/FileUpload.js"
import multer from "multer"
const storage = multer.diskStorage({
    destination:function (req,file,cd) {
        cd(null,"uploads/")
    },
    filename: function (req, file, cd) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cd(null, `${uniqueSuffix}-${file.originalname}`);
    }
})
const upload = multer({ storage:storage })

const route = Router()

route.post("/upload", upload.single('pdf'), FileUpload)

export default route