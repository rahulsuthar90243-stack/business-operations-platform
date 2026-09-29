import express from "express"
import cookieParser from "cookie-parser"
import router from "./routers/user.router.js"
import customerRouter from "./routers/deashboard.router/customer.router.js"
import adminRouter from "./routers/deashboard.router/admin.router.js"
import employeeRouter from "./routers/deashboard.router/employee.router.js"
import managerRouter from "./routers/deashboard.router/manager.router.js"


const app = express();
app.use(express.json());
app.use(cookieParser());


app.use("/api", router);
app.use("/api", customerRouter);
app.use("/api", adminRouter);
app.use("/api", employeeRouter);
app.use("/api", managerRouter);


export default app;