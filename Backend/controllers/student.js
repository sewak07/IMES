import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

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

/* -------------------- Dashboard -------------------- */
export const studentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("username");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

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
      "username semester attendance marks"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔹 Get all subjects of this semester from teachers
    const teachers = await Teacher.find({
      "subjects.semester": student.semester,
    }).select("subjects");

    const semesterSubjects = [
      ...new Set(
        teachers.flatMap((t) =>
          t.subjects
            .filter((s) => s.semester === student.semester)
            .map((s) => s.name)
        )
      ),
    ];

    const performance = semesterSubjects.map((subject) => {
      const attendance =
        student.attendance.find((a) => a.subject === subject) || {
          attendedDays: 0,
          totalDays: 0,
          percentage: 0,
          marks: 0,
          qualified: true,
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

      const attendanceMarks = isQualified ? attendance.marks : "NQ";

      const internalPoints = marksToPoints(marks.internal);
      const midTermPoints = marksToPoints(marks.midTerm);

      const assignmentsTotal =
        marks.assignment1 + marks.assignment2 + marks.assignment3;

      const totalAssessment = isQualified
        ? internalPoints +
          midTermPoints +
          assignmentsTotal +
          attendanceMarks
        : "NQ";

      return {
        subject,
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
        },
        isQualified,
        attendanceMarks,
        totalAssessment,
      };
    });

    res.json({
      student: {
        username: student.username,
        semester: student.semester,
      },
      performance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
