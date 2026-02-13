import mongoose from "mongoose"

const checkConnection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, { serverSelectionTimeoutMS: 5000 })
        console.log('db connected Successfully');
    } catch (error) {
        console.log('db Failed to connect',error);
    }
}

export default checkConnection