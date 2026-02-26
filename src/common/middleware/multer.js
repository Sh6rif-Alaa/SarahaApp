import multer from 'multer'
import fs from "node:fs"
import { v4 as uuidv4 } from 'uuid'

const multer_local = ({ custom_path = 'general', custom_type = [] } = {}) => {
    const filePath = `uploads/${custom_path}`
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true })

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, filePath)
        },
        filename: (req, file, cb) => {
            cb(null, uuidv4() + '-' + file.originalname)
        },
    })

    function fileFilter(req, file, cb) {
        if (!custom_type.includes(file.mimetype))
            cb(new Error(`this type ${file.mimetype} not allowed`, { cause: 400 }))
        else
            cb(null, true)
    }

    return multer({ storage, fileFilter })
}

export default multer_local