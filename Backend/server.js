import app from "./src/app.js"
import "dotenv/config"
import connectDB from "./src/Database/db.js"

const PORT = process.env.PORT;

connectDB();

app.get("/", (req, res) => {
    res.send("Business Management System Backend");
})

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
})