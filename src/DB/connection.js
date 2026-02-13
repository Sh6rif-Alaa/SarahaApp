import mongoose from "mongoose"

const checkConnection = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/saraha', { serverSelectionTimeoutMS: 5000 })
        console.log('db connected Successfully');
    } catch (error) {
        console.log('db Failed to connect',error);
    }
}

export default checkConnection