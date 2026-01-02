import { useEffect, useState } from "react";
import axios from "axios";
import AttendanceTable from "./AttendanceTable";
import InternalAssessmentTable from "./InternalAssessmentTable";
import styles from "./TeacherDashboard.module.css";

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState("");
  const [faculty, setFaculty] = useState("");
  const [students, setStudents] = useState([]);
  const [welcome, setWelcome] = useState("");
  const [viewType, setViewType] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadDashboard();
    loadSubjects();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:9001/api/teacher/dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWelcome(res.data.message);
    } catch (err) {
      console.log(err);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await axios.get(
        "http://localhost:9001/api/teacher/subjects",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(res.data.subjects);
    } catch {
      alert("Failed to load subjects");
    }
  };

  const loadStudents = async (type) => {
    if (!semester || !faculty) {
      alert("Please select semester and program");
      return;
    }

    setViewType(type);
    setStudents([]);

    try {
      const res = await axios.get(
        `http://localhost:9001/api/teacher/students/${faculty}/${semester}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data.students);
    } catch {
      alert("Failed to load students");
    }
  };

  const handleAttendanceUpdate = (studentId, updatedAttendance) => {
    setStudents(prev =>
      prev.map(student => {
        if (student._id === studentId) {
          return {
            ...student,
            attendance: student.attendance.map(a =>
              a.subject === updatedAttendance.subject ? updatedAttendance : a
            )
          };
        }
        return student;
      })
    );
  };

  const selectedSubject = subjects.find(
    s => Number(s.semester) === Number(semester)
  );

  return (
    <div className={styles.teacherDashboardWrapper}>
      {/* TOP HEADER */}
      <div className={styles.topBar}>
        <h2>{welcome}</h2>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.contentArea}>
        {/* LEFT PANEL */}
        <div className={styles.leftPanel}>
          <div className={styles.card}>
            <h3>Your Assigned Subjects</h3>
            {subjects.length === 0 ? (
              <p>No subjects assigned</p>
            ) : (
              <ul className={styles.subjectList}>
                {subjects.map((s, i) => (
                  <li key={i} className={styles.subjectItem}>
                    <strong>{s.name}</strong> <span>Semester {s.semester}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.card}>
            <h3>Select Semester & Program</h3>
            <div className={styles.selectGroup}>
              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">-- Semester --</option>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} Semester</option>
                ))}
              </select>

              <select
                value={faculty}
                onChange={e => setFaculty(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">-- Program --</option>
                <option value="BCA">BCA</option>
                <option value="CSIT">CSIT</option>
                <option value="BBA">BBA</option>
                <option value="BIM">BIM</option>
                <option value="BSC">BSC</option>
              </select>
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={`${styles.loadButton} ${styles.attendanceBtn}`}
                onClick={() => loadStudents("attendance")}
              >
                Load Attendance
              </button>
              <button
                className={`${styles.loadButton} ${styles.marksBtn}`}
                onClick={() => loadStudents("marks")}
              >
                Load Internal Assessment
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          <h3>Students</h3>

          {students.length === 0 && <p className={styles.noData}>No students loaded.</p>}

          {semester && faculty && !selectedSubject && (
            <p className={styles.errorText}>
              No subject assigned for this semester
            </p>
          )}

          {viewType === "attendance" && selectedSubject && (
            <AttendanceTable
              students={students}
              subject={selectedSubject}
              semester={semester}
              token={token}
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          )}

          {viewType === "marks" && selectedSubject && (
            <InternalAssessmentTable
              students={students}
              selectedSubject={selectedSubject.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
