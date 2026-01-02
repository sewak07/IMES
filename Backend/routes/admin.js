import express from "express";
import {
  addStudent,
  addTeacher,
  getAllStudents,
  getAllTeachers,
  updateStudent,
  updateTeacher,
  deleteStudent,
  deleteTeacher,
  downloadStudentPerformance,
  getStudentPerformanceJSON,
  changeAdminPassword
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes for admin
router.use(authMiddleware(["Admin"]));

router.post("/student", addStudent);
router.post("/teacher", addTeacher);
router.get("/students", getAllStudents);
router.get("/teachers", getAllTeachers);
router.put("/student/:id", updateStudent);
router.put("/teacher/:id", updateTeacher);
router.delete("/student/:id", deleteStudent);
router.delete("/teacher/:id", deleteTeacher);

// Download student performance
router.get("/download/student/:id", downloadStudentPerformance);

// view student performance
router.get("/student/performance/:id", getStudentPerformanceJSON);

// Change admin password
router.post("/change-password", changeAdminPassword);

export default router;
