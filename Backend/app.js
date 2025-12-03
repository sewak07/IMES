import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.js";
import adminRoute from "./routes/admin.js";
import teacherRoute from "./routes/teacher.js";
import studentRoute from "./routes/student.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/teacher", teacherRoute);
app.use("/api/student", studentRoute);

export default app;
