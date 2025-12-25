import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  teacherDashboard,
  getAssignedSubjects,
  getStudentsByFacultyAndSemester,
  updateMarks,
  updateAttendance
} from "../controllers/teacher.js";

const router = express.Router();

router.get("/dashboard", authMiddleware(["Teacher"]), teacherDashboard);
router.get("/subjects", authMiddleware(["Teacher"]), getAssignedSubjects);
router.get("/students/:faculty/:semester", authMiddleware(["Teacher"]), getStudentsByFacultyAndSemester);
router.put("/attendance", authMiddleware(["Teacher"]), updateAttendance);

router.post("/marks", authMiddleware(["Teacher"]), updateMarks);

export default router;
