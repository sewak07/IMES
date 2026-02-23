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

/* -------------------- Calculate Attendance Marks (TA Logic) -------------------- */
const calculateAttendanceMarks = (attendance) => {
  if (!attendance || attendance.totalDays === 0) return 0;

  const totalAbsent = attendance.totalDays - attendance.attendedDays;
  const percent = (attendance.attendedDays / attendance.totalDays) * 100;

  // Not qualified if attendance < 80%
  if (percent < 80) return 0;

  // Marks based on total absent days
  if (totalAbsent <= 5) return 10;
  if (totalAbsent <= 10) return 8;
  if (totalAbsent <= 15) return 6;
  if (totalAbsent <= 20) return 4;

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
      "username email semester faculty attendance marks"
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
      const attendanceData =
        student.attendance.find((a) => a.subject === subject) || {
          attendedDays: 0,
          totalDays: 0,
        };

      const attendedDays = Number(attendanceData.attendedDays) || 0;
      const totalDays = Number(attendanceData.totalDays) || 0;
      const totalAbsent = totalDays - attendedDays;
      const percentAttendance = totalDays > 0 ? (attendedDays / totalDays) * 100 : 0;

      const isQualified = percentAttendance >= 80;

      // TA-based attendance marks
      let attendanceMarks = 0;
      if (isQualified) {
        if (totalAbsent <= 5) attendanceMarks = 10;
        else if (totalAbsent <= 10) attendanceMarks = 8;
        else if (totalAbsent <= 15) attendanceMarks = 6;
        else if (totalAbsent <= 20) attendanceMarks = 4;
        else attendanceMarks = 0;
      }

      const marksData =
        student.marks.find((m) => m.subject === subject) || {
          internal: 0,
          midTerm: 0,
          assignment1: 0,
          assignment2: 0,
          assignment3: 0,
        };

      const internalPoints = marksToPoints(marksData.internal);
      const midTermPoints = marksToPoints(marksData.midTerm);
      const assignmentsTotal =
        marksData.assignment1 + marksData.assignment2 + marksData.assignment3;

      const totalAssessment = isQualified
        ? internalPoints + midTermPoints + assignmentsTotal + attendanceMarks
        : "NQ";

      return {
        subject,
        teacherName: subjectTeacherMap[subject] || "—",
        semester: student.semester,
        attendance: {
          attendedDays,
          totalDays,
          totalAbsent,
          marks: attendanceMarks,
          percentage: percentAttendance.toFixed(2),
        },
        marks: {
          rawInternal: marksData.internal,
          rawMidTerm: marksData.midTerm,
          internal: internalPoints,
          midTerm: midTermPoints,
          assignment1: marksData.assignment1,
          assignment2: marksData.assignment2,
          assignment3: marksData.assignment3,
          attendanceMarks,
        },
        isQualified,
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
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, student.password);
    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);
    await student.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};
