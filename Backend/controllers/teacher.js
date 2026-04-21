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
export const getStudentsByFacultyAndSemester = async (req, res) => {
  try {
    const semester = Number(req.params.semester);
    const faculty = req.params.faculty.trim(); // IMPORTANT

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Filter teacher subjects for this semester AND faculty
    const allowedSubjects = teacher.subjects.filter(
      s =>
        Number(s.semester) === semester &&
        s.faculty.trim().toLowerCase() === faculty.toLowerCase()
    );

    if (allowedSubjects.length === 0) {
      return res.status(403).json({ message: "Not allowed to access this semester/faculty" });
    }

    // Fetch students of the same semester AND faculty
    const students = await Student.find({
      semester,
      faculty: { $regex: `^${faculty}$`, $options: "i" }
    })
      .sort({ username: 1 })
      .select("username email semester faculty attendance marks");

    // Initialize attendance only for subjects the teacher teaches
    const studentsWithAttendance = [];

    for (const student of students) {
      let changed = false;
      const updatedAttendance = [...(student.attendance || [])];

      allowedSubjects.forEach(sub => {
        if (!updatedAttendance.some(
          a => a.subject.trim().toLowerCase() === sub.name.trim().toLowerCase()
        )) {
          updatedAttendance.push({
            subject: sub.name,
            semester: sub.semester,
            attendedDays: 0,
            totalDays: 0,
            percentage: 0,
            marks: 0,
            qualified: true
          });
          changed = true;
        }
      });

      if (changed) {
        student.attendance = updatedAttendance;
        await student.save(); 
      }

      studentsWithAttendance.push(student.toObject());
    }


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

    // Fetch teacher
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Fetch student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if teacher is allowed to mark attendance for this student's faculty and semester
    const allowed = teacher.subjects.some(
      s =>
        s.name.trim().toLowerCase() === subject.trim().toLowerCase() &&
        Number(s.semester) === Number(semester) &&
        s.faculty.trim().toLowerCase() === student.faculty.trim().toLowerCase()
    );
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to mark attendance for this student" });
    }

    // Ensure attendance array exists
    if (!Array.isArray(student.attendance)) student.attendance = [];

    // Find or create attendance record for this subject
    let attendance = student.attendance.find(a => a.subject === subject);
    if (!attendance) {
      attendance = {
        subject,
        semester,
        attendedDays: 0,
        totalDays: 0,
        marks: 0,
        qualified: true
      };
      student.attendance.push(attendance);
    }

    // Update attendance
    attendance.totalDays += 1;
    if (present) attendance.attendedDays += 1;
    attendance.percentage = (attendance.attendedDays / attendance.totalDays) * 100;

    const absentDays = attendance.totalDays - attendance.attendedDays;

    // Calculate marks and qualification
    if (attendance.percentage < 80) {
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

    await student.save();

    res.json({ message: "Attendance marked", attendance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const marksToPoints = (marks) => {
  const m = Number(marks);
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

const lockAssignment = (oldValue, oldSubmitted, newValue) => {
  if (oldSubmitted) {
    return {
      value: oldValue,
      submitted: true
    };
  }

  if (Number(newValue) > 0) {
    return {
      value: Number(newValue),
      submitted: true
    };
  }

  return {
    value: 0,
    submitted: false
  };
};

// Update marks with assignment tracking
export const updateMarks = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      semester,
      internal = 0,
      midTerm = 0,
      assignment1 = 0,
      assignment2 = 0,
      assignment3 = 0
    } = req.body;

    if (!studentId || !subject || semester === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const allowed = teacher.subjects.some(
      s =>
        s.name.trim().toLowerCase() === subject.trim().toLowerCase() &&
        Number(s.semester) === Number(semester)
    );
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to modify this subject" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Attendance lookup
    const attendance = (student.attendance || []).find(
      a => a.subject.trim().toLowerCase() === subject.trim().toLowerCase()
    );

    const attendanceMarks =
      attendance && attendance.qualified ? Number(attendance.marks || 0) : 0;

    // Find marks
    let mark = student.marks.find(
      m => m.subject.trim().toLowerCase() === subject.trim().toLowerCase()
    );

    if (!mark) {
      // FIRST TIME ENTRY
      mark = {
        subject,
        semester,
        internal,
        midTerm,

        assignment1: Number(assignment1),
        assignment2: Number(assignment2),
        assignment3: Number(assignment3),

        assignment1Submitted: Number(assignment1) > 0,
        assignment2Submitted: Number(assignment2) > 0,
        assignment3Submitted: Number(assignment3) > 0,

        total: 0
      };
      student.marks.push(mark);
    } else {
      // Exams can always be updated
      mark.internal = internal;
      mark.midTerm = midTerm;

      //  Assignment lock enforcement
      const a1 = lockAssignment(
        mark.assignment1,
        mark.assignment1Submitted,
        assignment1
      );
      const a2 = lockAssignment(
        mark.assignment2,
        mark.assignment2Submitted,
        assignment2
      );
      const a3 = lockAssignment(
        mark.assignment3,
        mark.assignment3Submitted,
        assignment3
      );

      mark.assignment1 = a1.value;
      mark.assignment1Submitted = a1.submitted;

      mark.assignment2 = a2.value;
      mark.assignment2Submitted = a2.submitted;

      mark.assignment3 = a3.value;
      mark.assignment3Submitted = a3.submitted;
    }

    // Points conversion
    const internalPoints = marksToPoints(mark.internal);
    const midTermPoints = marksToPoints(mark.midTerm);

    const assignmentsTotal =
      mark.assignment1 +
      mark.assignment2 +
      mark.assignment3;

    mark.total =
      internalPoints +
      midTermPoints +
      assignmentsTotal +
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


//password change
export const changeTeacherPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validation
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Find teacher
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Verify email matches
    if (teacher.email !== email) {
      return res.status(403).json({
        success: false,
        message: "Email does not match"
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, teacher.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    // Check if new password is same as old
    const isSameAsOld = await bcrypt.compare(newPassword, teacher.password);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(newPassword, salt);

    await teacher.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};