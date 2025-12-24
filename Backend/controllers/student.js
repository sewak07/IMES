import Student from "../models/Student.js";

// Student dashboard
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

// Student performance
export const studentPerformance = async (req, res) => {
  try {
    // Make sure to select the correct fields
    const student = await Student.findById(req.user.id).select(
      "username semester attendance marks"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const performance = student.marks.map((m) => {
      const attendance =
        student.attendance.find((a) => a.subject === m.subject) || {
          attendedDays: 0,
          totalDays: 0,
          percentage: 0,
        };

      return {
        subject: m.subject,
        semester: student.semester,
        attendance,
        marks: m,
        qualified: attendance.percentage >= 80,
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
