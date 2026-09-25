import mongoose from "mongoose";
import "dotenv/config"


async function connectDB() {
    try {
        if(!process.env.MONGODB_URL || !process.env.DB_NAME){
        console.log("MONGODB_URL or DB_NAME is not defined in the environment");
        }

        const mongo_url = `${process.env.MONGODB_URL}/${process.env.DB_NAME}`
        await mongoose.connect(mongo_url);
        console.log("MongoDB Connection successfully");
        
    } catch (error) {
        console.log("MongoDB Connection Error: ", error);
        throw new error   
    }
}

export default connectDB