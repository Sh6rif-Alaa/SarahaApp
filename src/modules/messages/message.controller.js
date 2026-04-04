import { Router } from "express";
import { multer_host } from "../../common/middleware/multer.js";
import multerEnum from "../../common/enum/multer.enum.js";
import { getMessage, getMessages, sendMessage } from "./message.service.js";
import validation from './../../common/middleware/validation.js';
import { getMessageSchema, sendMessageSchema } from "./message.validation.js";
import authentication from "../../common/middleware/authentication.js";
import { env } from "../../../config/config.service.js";

const messageRouter = Router({ caseSensitive: true, strict: true })

messageRouter.post("/send", multer_host(multerEnum.image).array('attachments', 3), validation(sendMessageSchema), sendMessage)
messageRouter.get("/", authentication(env.TOKEN_KEY), getMessages)
messageRouter.get("/:messageId", authentication(env.TOKEN_KEY), validation(getMessageSchema), getMessage)

export default messageRouter