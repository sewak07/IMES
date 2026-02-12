import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
  studentDashboard, 
  studentPerformance,
  changePassword 
} from "../controllers/student.js";

const router = express.Router();

router.get("/dashboard", authMiddleware(["Student"]), studentDashboard);
router.get("/performance", authMiddleware(["Student"]), studentPerformance);
router.post("/change-password", authMiddleware(["Student"]), changePassword);

export default router;