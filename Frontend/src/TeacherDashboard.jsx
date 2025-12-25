import { useEffect, useState } from "react";
import axios from "axios";
import StudentRow from "./StudentRow";
import styles from "./TeacherDashboard.module.css";

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState("");
  const [faculty, setFaculty] = useState("");
  const [students, setStudents] = useState([]);
  const [welcome, setWelcome] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboard();
    fetchSubjects();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:9001/api/teacher/dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWelcome(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
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

  const fetchStudents = async () => {
    if (!semester || !faculty) {
      alert("Select faculty and semester");
      return;
    }

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
          const newAttendance = student.attendance.map(a => {
            if (a.subject === updatedAttendance.subject) return updatedAttendance;
            return a;
          });
          return { ...student, attendance: newAttendance };
        }
        return student;
      })
    );
  };

  return (
    <div className={styles.teacherDashboardWrapper}>
      <div className={styles.topBar}>
        <h2>{welcome}</h2>
      </div>
      <div className={styles.contentArea}>
        <div className={styles.subjectSemester}>
          <h3>Your Assigned Subjects</h3>
          <ul>
            {subjects.map((s, i) => (
              <li key={i}>
                {s.name} (Semester {s.semester})
              </li>
            ))}
          </ul>

          <h3>Select Semester</h3>
          <input
            type="number"
            value={semester}
            onChange={(e) => { setSemester(e.target.value); setStudents([]); }}
            placeholder="Semester"
            className={styles.semesterInput}
          />
          <br></br><br></br>
          <h3>Select Faculty</h3>
          <input
            type="text"
            value={faculty}
            onChange={(e) => {
              setFaculty(e.target.value);
              setStudents([]);
            }}
            placeholder="Faculty (e.g. BSc CSIT)"
            className={styles.semesterInput}
          />

          <button className={styles.loadButton} onClick={fetchStudents}>
            Load Students
          </button>
        </div>

        <div className={styles.studentsContainer}>
          <h3>Students</h3>
          {students.map((student) =>
            subjects
              .filter(s => Number(s.semester) === Number(semester))
              .map((subject, idx) => (
                <StudentRow
                  key={`${student._id}-${idx}`}
                  student={student}
                  subject={subject}
                  token={token}
                  onAttendanceUpdate={handleAttendanceUpdate}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
