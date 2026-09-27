import express from "express"
import cookieParser from "cookie-parser"
import router from "./routers/user.router.js"

const app = express();
app.use(express.json())
app.use(cookieParser())

app.use("/api", router)

export default app;