import app from "./src/app.js";
import "dotenv/config";
import connectDB from "./src/Database/db.js";


const PORT = process.env.PORT

const startServer = async () => {
  try {
    
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGO_URI is not defined");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    await connectDB();

    app.get("/", (req, res) => {
      res.send("Business Management System")
    })

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
