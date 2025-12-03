import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addStudent, addTeacher, getAllStudents, getAllTeachers, searchUser,
  updateStudent, deleteStudent, updateTeacher, deleteTeacher,
  assignSubjectToTeacher, downloadStudentsReport, changeAdminPassword
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes protected
router.use(authMiddleware(["Admin"]));

// Admin Welcome Dashboard
router.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// Student controls
router.post("/student", addStudent);
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);
router.get("/students", getAllStudents);

// Teacher controls
router.post("/teacher", addTeacher);
router.put("/teacher/:id", updateTeacher);
router.delete("/teacher/:id", deleteTeacher);
router.get("/teachers", getAllTeachers);

// Search
router.get("/search", searchUser);

// Assign subject
router.post("/teacher/:teacherId/assign-subject", assignSubjectToTeacher);

// Download CSV
router.get("/download/students", downloadStudentsReport);

// Change admin password
router.post("/change-password", changeAdminPassword);

export default router;
