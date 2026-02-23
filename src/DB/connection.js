import mongoose from "mongoose"
import { env } from "../../config/config.service.js";

const checkConnection = async () => {
    try {
        await mongoose.connect(env.DATABASE_URL, { serverSelectionTimeoutMS: 5000 })
        console.log('db connected Successfully');
    } catch (error) {
        console.log('db Failed to connect',error);
    }
}

export default checkConnection