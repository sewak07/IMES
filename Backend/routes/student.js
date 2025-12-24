import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { studentDashboard, studentPerformance } from "../controllers/student.js";

const router = express.Router();

router.get("/dashboard", authMiddleware(["Student"]), studentDashboard);
router.get("/performance", authMiddleware(["Student"]), studentPerformance);


export default router;