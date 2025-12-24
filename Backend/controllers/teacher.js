import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

const teacherHasSubject = (teacher, subject, semester) => {
  return teacher.subjects.some(
    s => s.name === subject && Number(s.semester) === Number(semester)
  );
};

// Teacher dashboard welcome
export const teacherDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select("username");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ message: `Welcome ${teacher.username}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get subjects assigned to teacher
export const getAssignedSubjects = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select("subjects");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ subjects: teacher.subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get students by semester with attendance initialized
export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = Number(req.params.semester);
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const allowed = teacher.subjects.some(s => Number(s.semester) === semester);
    if (!allowed) return res.status(403).json({ message: "Not allowed to access this semester" });

    const students = await Student.find({ semester })
      .sort({ username: 1 }) 
      .select("username email semester attendance marks");

    const subjectsOfSemester = teacher.subjects.filter(s => Number(s.semester) === semester);

    const studentsWithAttendance = students.map(student => {
      const updatedAttendance = [...(student.attendance || [])];

      subjectsOfSemester.forEach(sub => {
        if (!updatedAttendance.some(a => a.subject === sub.name)) {
          updatedAttendance.push({
            subject: sub.name,
            semester: sub.semester,
            attendedDays: 0,
            totalDays: 0,
            percentage: 0,
            marks: 0
          });
        }
      });

      return { ...student.toObject(), attendance: updatedAttendance };
    });

    res.json({ students: studentsWithAttendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update attendance with grading
export const updateAttendance = async (req, res) => {
  try {
    const { studentId, subject, semester, present } = req.body;
    if (!studentId || !subject || semester === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const allowed = teacher.subjects.some(
      s => s.name === subject && Number(s.semester) === Number(semester)
    );
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to mark attendance" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!Array.isArray(student.attendance)) student.attendance = [];

    let attendance = student.attendance.find(a => a.subject === subject);
    if (!attendance) {
      attendance = {
        subject,
        semester,
        attendedDays: 0,
        totalDays: 0,
        percentage: 0,
        marks: 0
      };
      student.attendance.push(attendance);
    }

    attendance.totalDays += 1;
    if (present) attendance.attendedDays += 1;

    attendance.percentage =
      attendance.totalDays > 0
        ? (attendance.attendedDays / attendance.totalDays) * 100
        : 0;

    const calculateAttendanceMarks = (p) => {
      if (p >= 95) return 5;
      if (p >= 90) return 4;
      if (p >= 85) return 3;
      if (p >= 80) return 2;
      return 0;
    };

    attendance.marks = calculateAttendanceMarks(attendance.percentage);

    const mark = student.marks.find(m => m.subject === subject);
    if (mark) {
      mark.total =
        attendance.marks +
        mark.assignment +
        mark.labReport +
        mark.practical +
        mark.viva;
    }

    await student.save();

    res.json({ message: "Attendance marked", attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update marks (assignments, lab, practical, viva) + total calculation
export const updateMarks = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      semester,
      internal = 0,
      midTerm = 0,
      assignment = 0,
      labReport = 0,
      practical = 0,
      viva = 0
    } = req.body;

    if (!studentId || !subject || semester === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const allowed = teacher.subjects.some(
      s => s.name === subject && Number(s.semester) === Number(semester)
    );
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to modify this subject" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    //attendence lookyp
    const attendance = (student.attendance || []).find(
      a => a.subject === subject
    );

    let attendanceMarks = 0;
    if (attendance && attendance.totalDays > 0) {
      attendanceMarks = attendance.percentage >= 80 ? attendance.marks : 0;
    }

    //marks update
    let mark = student.marks.find(m => m.subject === subject);

    if (!mark) {
      mark = {
        subject,
        semester,
        internal,
        midTerm,
        assignment,
        labReport,
        practical,
        viva,
        total: 0
      };
      student.marks.push(mark);
    } else {
      mark.internal = internal;
      mark.midTerm = midTerm;
      mark.assignment = assignment;
      mark.labReport = labReport;
      mark.practical = practical;
      mark.viva = viva;
    }

    //total calc
    mark.total =
      assignment +
      labReport +
      practical +
      viva +
      attendanceMarks;

    await student.save();

    res.json({
      message: "Marks updated successfully",
      marks: mark
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

