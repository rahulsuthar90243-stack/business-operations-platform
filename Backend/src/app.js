import express from "express"
import cookieParser from "cookie-parser"
import router from "./routers/user.router.js"
import customerRouter from "./routers/deashboard.router/customer.router.js"
import adminRouter from "./routers/deashboard.router/admin.router.js"
import employeeRouter from "./routers/deashboard.router/employee.router.js"
import managerRouter from "./routers/deashboard.router/manager.router.js"
import cors from "cors"
import projectRouter from "./routers/project.router.js"
import ticketRouter from "./routers/ticket.router.js"


// import fs from "fs"
// import path from "path"
// import { fileURLToPath } from "url"

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}))
// Serve OpenAPI Specification
// app.get("/api/docs/openapi.json", (req, res) => {
//     const specPath = path.join(__dirname, "docs", "openapi.json");
//     if (fs.existsSync(specPath)) {
//         res.setHeader("Content-Type", "application/json");
//         return res.sendFile(specPath);
//     }
//     return res.status(404).json({ message: "OpenAPI specification not found" });
// });

app.use("/api", router);
app.use("/api", customerRouter);
app.use("/api", adminRouter);
app.use("/api", employeeRouter);
app.use("/api", managerRouter);

// project Router

app.use("/api", projectRouter);

//ticket router

app.use("/api", ticketRouter);


export default app;