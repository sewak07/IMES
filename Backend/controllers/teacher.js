import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";


const teacherHasSubject = (teacher, subject, semester) => {
  return teacher.subjects.some(
    s => s.name === subject && Number(s.semester) === Number(semester)
  );
};


export const teacherDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select("username");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      message: `Welcome ${teacher.username}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getAssignedSubjects = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select("subjects");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ subjects: teacher.subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentsBySemester = async (req, res) => {
  try {
    const semester = Number(req.params.semester);

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // ❗ Check if teacher teaches this semester
    const allowed = teacher.subjects.some(
      s => Number(s.semester) === semester
    );

    if (!allowed) {
      return res.status(403).json({
        message: "You are not allowed to access this semester"
      });
    }

    const students = await Student.find({ semester })
      .select("username email semester attendence");

    // 🔹 Initialize attendance for all subjects teacher teaches
    const subjectsOfSemester = teacher.subjects.filter(
      s => Number(s.semester) === semester
    );

    const studentsWithAttendance = students.map(student => {
      const updatedAttendance = [...student.attendence];

      subjectsOfSemester.forEach(sub => {
        if (!updatedAttendance.some(a => a.subject === sub.name)) {
          updatedAttendance.push({ subject: sub.name, attendend: 0, total: 0 });
        }
      });

      return {
        ...student.toObject(),
        attendence: updatedAttendance
      };
    });

    res.json({ students: studentsWithAttendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const updateMarks = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      semester,
      internalMarks,
      totalMarks
    } = req.body;

    if (!studentId || !subject || !semester) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (!teacherHasSubject(teacher, subject, semester)) {
      return res.status(403).json({
        message: "You are not allowed to modify this subject"
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let mark = student.marks.find(m => m.subject === subject);

    if (!mark) {
      student.marks.push({
        subject,
        internalMarks: internalMarks || 0,
        totalMarks: totalMarks || 0
      });
    } else {
      mark.internalMarks = internalMarks ?? mark.internalMarks;
      mark.totalMarks = totalMarks ?? mark.totalMarks;
    }

    await student.save();

    res.json({ message: "Marks updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { studentId, subject, semester, present } = req.body;

    if (!studentId || !subject || semester === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const allowed = teacher.subjects.some(
      s => s.name === subject && Number(s.semester) === Number(semester)
    );

    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to mark attendance" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let attendance = student.attendence.find(a => a.subject === subject);

    if (!attendance) {
      student.attendence.push({
        subject,
        attendend: 0,
        total: 0
      });
    }


    attendance = student.attendence.find(a => a.subject === subject);


    attendance.total += 1;

    if (present === true) {
      attendance.attendend += 1;
    }

    await student.save();


    const updatedAttendance = student.attendence.find(
      a => a.subject === subject
    );

    res.json({
      message: "Attendance marked",
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
