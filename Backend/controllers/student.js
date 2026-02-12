import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import bcrypt from "bcrypt";

/* -------------------- Utils -------------------- */
const marksToPoints = (marks) => {
  const m = Number(marks);
  if (m >= 56) return 10;
  if (m >= 51) return 9;
  if (m >= 46) return 8;
  if (m >= 41) return 7;
  if (m >= 36) return 6;
  if (m >= 31) return 5;
  if (m >= 26) return 4;
  if (m >= 21) return 3;
  if (m >= 16) return 2;
  if (m >= 1) return 1;
  return 0;
};

/* -------------------- Calculate Attendance Marks -------------------- */
const calculateAttendanceMarks = (attendance) => {
  if (!attendance || attendance.totalDays === 0) return 0;
  const percent = (attendance.attendedDays / attendance.totalDays) * 100;

  // Give marks based on percentage (max 5)
  if (percent >= 95) return 5;
  if (percent >= 85) return 4;
  if (percent >= 75) return 3;
  if (percent >= 65) return 2;
  if (percent >= 50) return 1;
  return 0;
};

/* -------------------- Dashboard -------------------- */
export const studentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("username");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: `Welcome ${student.username}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- Performance -------------------- */
export const studentPerformance = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select(
      "username email semester attendance marks"
    );
    if (!student) return res.status(404).json({ message: "Student not found" });

    
    const teachers = await Teacher.find({
      "subjects.semester": student.semester,
    }).select("username subjects");

    const subjectTeacherMap = {};
    teachers.forEach((teacher) => {
      teacher.subjects.forEach((subj) => {
        if (subj.semester === student.semester) {
          subjectTeacherMap[subj.name] = teacher.username;
        }
      });
    });

    const semesterSubjects = Object.keys(subjectTeacherMap);

    const performance = semesterSubjects.map((subject) => {
      const attendance =
        student.attendance.find((a) => a.subject === subject) || {
          attendedDays: 0,
          totalDays: 0,
          percentage: 0,
        };

      const marks =
        student.marks.find((m) => m.subject === subject) || {
          internal: 0,
          midTerm: 0,
          assignment1: 0,
          assignment2: 0,
          assignment3: 0,
        };

      const isQualified = attendance.percentage >= 80;
      const attendanceMarks = isQualified
        ? calculateAttendanceMarks(attendance)
        : 0;

      const internalPoints = marksToPoints(marks.internal);
      const midTermPoints = marksToPoints(marks.midTerm);
      const assignmentsTotal =
        marks.assignment1 + marks.assignment2 + marks.assignment3;

      const totalAssessment = isQualified
        ? internalPoints + midTermPoints + assignmentsTotal + attendanceMarks
        : "NQ";

      return {
        subject,
        teacherName: subjectTeacherMap[subject] || "—",
        semester: student.semester,
        attendance,
        marks: {
          rawInternal: marks.internal,
          rawMidTerm: marks.midTerm,
          internal: internalPoints,
          midTerm: midTermPoints,
          assignment1: marks.assignment1,
          assignment2: marks.assignment2,
          assignment3: marks.assignment3,
          attendanceMarks, 
        },
        isQualified,
        attendanceMarks,
        totalAssessment,
      };
    });

    res.json({
      student: {
        username: student.username,
        email: student.email,
        semester: student.semester,
      },
      performance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- Change Password -------------------- */
export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validate input
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be at least 6 characters long" 
      });
    }

    // Find the student
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Verify the student making the request is the same as the email provided
    if (student._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized to change this password" 
      });
    }

    // Verify old password
    const validPassword = await bcrypt.compare(oldPassword, student.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Check if new password is different from old password
    const samePassword = await bcrypt.compare(newPassword, student.password);
    if (samePassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be different from current password" 
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    await student.save();

    res.json({ 
      success: true,
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while changing password" 
    });
  }
};