import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

const hash = async (plain) => await bcrypt.hash(plain, 10);

//add student
export const addStudent = async (req, res) => {
  try {
    const { email, username, password, semester, faculty } = req.body;
    if (!email || !username) {
      return res.status(400).json({ message: "email & username required" });
    }
    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Student with this email already exists" });
    }

    const hashed = password ? await hash(password) : undefined;

    const student = new Student({ email, username, password: hashed, semester, faculty });
    await student.save();

    res.status(201).json({ message: "student created", studentId: student._id });


  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};

//add teacher
export const addTeacher = async (req, res) => {
  try {
    const { email, username, password, subjects } = req.body;
    if (!email || !username) {
      return res.status(404).json({ message: "Email and username required" });
    }

    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Teacher with this email already exists" });
    }

    const hashed = password ? await hash(password) : undefined;

    const formattedSubjects = Array.isArray(subjects) ? subjects.map(s => ({
      name: s.name,
      semester: Number(s.semester) || null,
    })) : [];

    const teacher = new Teacher({ email, username, password: hashed, subjects: formattedSubjects, });

    await teacher.save();

    res.status(201).json({ message: "Teacher created", teacherId: teacher._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server errror" })
  }
};

//view all students + pagination 
export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const students = await Student.find().skip((page - 1) * limit).limit(Number(limit));
    res.json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//view all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const teachers = await Teacher.find().skip((page - 1) * limit).limit(Number(limit));
    res.json({ teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//search students and teachers by username or email
export const searchUser = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "q query required" });

    const students = await Student.find({
      $or: [
        { email: new RegExp(q, "i") },
        { username: new RegExp(q, "i") }
      ]
    });

    const teachers = await Teacher.find({
      $or: [
        { email: new RegExp(q, "i") },
        { username: new RegExp(q, "i") }
      ]
    });

    res.json({ students, teachers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//update student by id
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await hash(updates.password);
    }

    const updated = await Student.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student Updated", student: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//update teacher
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await hash(updates.password);
    }
    const updated = await Teacher.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json({ message: "Teacehr Updated", teacher: updated });

  } catch (error) {
    consolr.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Teacher.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json({ message: "Teacher deleted" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//Assign subjects to teacher
export const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params; const { subject, semester } = req.body;
    if (!subject) { return res.status(400).json({ message: "Subject is required" }); }

    const teacher = await Teacher.findById(teacherId);

    if (!teacherId) { return res.status(404).json({ message: "Teacher not found" }); }
    teacher.subjects.push({ name: subject, semester: semester || 0 });
    await teacher.save();

    res.json({ message: "Subject assigned", teacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};

//downlaod student cv
const makeCSV = (rows) => {
  const headeres = Object.keys(rows[0] || {});
  const escape = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
  return [headers.join(",")]
    .concat(rows.map(r => headers.map(h => escape(r[h])).join(",")))
    .join("\n");
};

export const downloadStudentsReport = async (req, res) => {
  try {
    const students = await Student.find();

    const rows = students.map(s => {
      const totalInternal = s.marks.reduce((acc, m) => acc + (m.internalMarks || 0), 0);
      const totalMarks = s.marks.reduce((acc, m) => acc + (m.totalMarks || 0), 0);
      const totalAttended = s.attendance.reduce((acc, a) => acc + (a.attended || 0), 0);
      const totalSessions = s.attendance.reduce((acc, a) => acc + (a.total || 0), 0);

      // flatten marks and attendance summary as strings
      const marksDetail = s.marks.map(m => `${m.subject}:${m.internalMarks}/${m.totalMarks}`).join("; ");
      const attendanceDetail = s.attendance.map(a => `${a.subject}:${a.attended}/${a.total}`).join("; ");

      return {
        id: s._id.toString(),
        username: s.username,
        email: s.email,
        semester: s.semester,
        marksDetail,
        totalInternal,
        totalMarks,
        attendanceDetail,
        totalAttended,
        totalSessions
      };
    });

    const csv = makeCSV(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="students_report_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// admin change password
export const changeAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const ok = await bcrypt.compare(oldPassword, admin.password);
    if (!ok) return res.status(401).json({ message: "Old password incorrect" });

    admin.password = await hash(newPassword);
    await admin.save();
    res.json({ message: "Password changed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
