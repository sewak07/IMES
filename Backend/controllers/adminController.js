import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

const hash = async (plain) => await bcrypt.hash(plain, 10);



// ---------------------- Add Student ----------------------
export const addStudent = async (req, res) => {
  try {
    const { email, username, password, semester, faculty } = req.body;
    if (!email || !username) return res.status(400).json({ message: "Email & username required" });

    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: "Student already exists" });

    const student = new Student({
      email,
      username,
      password: password ? await hash(password) : undefined,
      semester,
      faculty
    });

    await student.save();
    res.status(201).json({ message: "Student created", studentId: student._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Add Teacher ----------------------
export const addTeacher = async (req, res) => {
  try {
    const { email, username, password, subjects } = req.body;
    if (!email || !username) return res.status(400).json({ message: "Email & username required" });

    const exists = await Teacher.findOne({ email });
    if (exists) return res.status(400).json({ message: "Teacher already exists" });

    const teacher = new Teacher({
      email,
      username,
      password: password ? await hash(password) : undefined,
      subjects: Array.isArray(subjects)
        ? subjects.map(s => ({ name: s.name?.trim(), semester: Number(s.semester) || null }))
        : []
    });

    await teacher.save();
    res.status(201).json({ message: "Teacher created", teacherId: teacher._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Get All Students ----------------------
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Get All Teachers ----------------------
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json({ teachers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Update Student ----------------------
export const updateStudent = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) updates.password = await hash(updates.password);

    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student updated", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Delete Student ----------------------
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Update Teacher ----------------------
export const updateTeacher = async (req, res) => {
  try {
    const { email, username, password, subjects } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    if (email !== undefined) teacher.email = email;
    if (username !== undefined) teacher.username = username;
    if (password) teacher.password = await hash(password);

    if (Array.isArray(subjects)) {
      teacher.subjects = [];
      for (const s of subjects) {
        if (!s.name) continue;
        teacher.subjects.push({ name: s.name.trim(), semester: Number(s.semester) || null });
      }
    }

    await teacher.save();
    res.json({ message: "Teacher updated", teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Delete Teacher ----------------------
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json({ message: "Teacher deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- Download Student Performance ----------------------
const marksToPoints = (m) => {
  if (m >= 56 && m <= 60) return 10;
  if (m >= 51 && m <= 55) return 9;
  if (m >= 46 && m <= 50) return 8;
  if (m >= 41 && m <= 45) return 7;
  if (m >= 36 && m <= 40) return 6;
  if (m >= 31 && m <= 35) return 5;
  if (m >= 26 && m <= 30) return 4;
  if (m >= 21 && m <= 25) return 3;
  if (m >= 16 && m <= 20) return 2;
  if (m >= 1 && m <= 15) return 1;
  return 0;
};

// ---------------------- Helper: Calculate Attendance Marks ----------------------
const calculateAttendance = (attended, total) => {
  const attendance = { percentage: 0, qualified: false, marks: null };
  if (total === 0) return attendance;

  const absentDays = total - attended;
  const percentage = (attended / total) * 100;
  attendance.percentage = percentage;

  if (percentage < 80) {
    attendance.qualified = false;
    attendance.marks = null;
  } else {
    attendance.qualified = true;
    if (absentDays <= 5) attendance.marks = 10;
    else if (absentDays <= 10) attendance.marks = 8;
    else if (absentDays <= 15) attendance.marks = 6;
    else if (absentDays <= 20) attendance.marks = 4;
    else {
      attendance.qualified = false;
      attendance.marks = null;
    }
  }
  return attendance;
};

// ---------------------- CSV Helper ----------------------
const toCSV = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(","))
  ].join("\n");
};

// ---------------------- Add / Update / Delete Students & Teachers ----------------------
// (Same as previous code, omitted for brevity; keep your existing CRUD code here)

// ---------------------- Download Student Performance ----------------------
export const downloadStudentPerformance = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const rows = student.attendance.map(att => {
      const mark = student.marks.find(m => m.subject === att.subject) || {};

      // Attendance marks using new logic
      const attendance = calculateAttendance(att.attendedDays, att.totalDays);

      // 1st term and 2nd term points from raw marks
      const firstTermPoints = marksToPoints(mark.internal || 0);
      const secondTermPoints = marksToPoints(mark.midTerm || 0);

      // Total assessment = points + assignments + attendance marks (if not null)
      const totalAssessment =
        firstTermPoints +
        secondTermPoints +
        (mark.assignment1 || 0) +
        (mark.assignment2 || 0) +
        (mark.assignment3 || 0) +
        (attendance.marks || 0);

      return {
        Username: student.username,
        Email: student.email,
        Faculty: student.faculty,
        Semester: student.semester,
        Subject: att.subject,
        AttendedDays: att.attendedDays,
        TotalDays: att.totalDays,
        AttendancePercent: attendance.percentage.toFixed(2),
        AttendanceMarks: attendance.marks,
        Qualified: attendance.qualified ? "YES" : "NO",
        RawInternal: mark.internal || 0,
        FirstTermPoints: firstTermPoints,
        MidTerm: mark.midTerm || 0,
        SecondTermPoints: secondTermPoints,
        Assignment1: mark.assignment1 || 0,
        Assignment2: mark.assignment2 || 0,
        Assignment3: mark.assignment3 || 0,
        TotalAssessment: totalAssessment
      };
    });

    const csv = toCSV(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${student.username}_performance.csv`
    );

    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// controllers/adminController.js
export const getStudentPerformanceJSON = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const performance = student.attendance.map((att) => {
      const mark = student.marks.find((m) => m.subject === att.subject) || {};

      const attendance = calculateAttendance(att.attendedDays, att.totalDays);

      const firstTermPoints = marksToPoints(mark.internal || 0);
      const secondTermPoints = marksToPoints(mark.midTerm || 0);

      return {
        subject: att.subject,
        attendance,
        attendanceMarks: attendance.marks,
        marks: {
          firstTerm: mark.internal || 0,
          secondTerm: mark.midTerm || 0
        },
        points: {
          firstTerm: firstTermPoints,
          secondTerm: secondTermPoints
        },
        assignments: {
          assignment1: mark.assignment1 || 0,
          assignment2: mark.assignment2 || 0,
          assignment3: mark.assignment3 || 0,
          assignment1Max: 3,
          assignment2Max: 3,
          assignment3Max: 4
        }
      };
    });

    res.json({ student, performance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch performance" });
  }
};


// ---------------------- Change Admin Password ----------------------
export const changeAdminPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const ok = await bcrypt.compare(req.body.oldPassword, admin.password);
    if (!ok) return res.status(401).json({ message: "Old password incorrect" });

    admin.password = await hash(req.body.newPassword);
    await admin.save();

    res.json({ message: "Password changed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
