import mongoose from "mongoose";
import "dotenv/config"


async function connectDB() {
    try {
        if(!process.env.MONGODB_URL || !process.env.DB_NAME){
        throw Error("MONGODB_URL or DB_NAME is not defined in the environment");
        }

        const mongo_url = `${process.env.MONGODB_URL}/${process.env.DB_NAME}`
        const connectionInstance =  await mongoose.connect(mongo_url, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB Connection successfully!! DB HOST ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB Connection Error: ", error);
        throw error
    }
}

export default connectDB