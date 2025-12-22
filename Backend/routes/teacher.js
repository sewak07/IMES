import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  teacherDashboard,
  getAssignedSubjects,
  getStudentsBySemester,
  updateMarks,
  updateAttendance
} from "../controllers/teacher.js";

const router = express.Router();

router.get("/dashboard", authMiddleware(["Teacher"]), teacherDashboard);
router.get("/subjects", authMiddleware(["Teacher"]), getAssignedSubjects);
router.get("/students/:semester", authMiddleware(["Teacher"]), getStudentsBySemester);
router.put("/marks", authMiddleware(["Teacher"]), updateMarks);
router.put("/attendance", authMiddleware(["Teacher"]), updateAttendance);

export default router;
