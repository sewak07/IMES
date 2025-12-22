import { useEffect, useState } from "react";
import axios from "axios";
import StudentRow from "./StudentRow";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState("");
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
    if (!semester) return;
    try {
      const res = await axios.get(
        `http://localhost:9001/api/teacher/students/${semester}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data.students);
    } catch {
      alert("Failed to load students");
    }
  };

  return (
    <div className="teacher-dashboard-wrapper">
      <div className="top-bar">
        <h2>{welcome}</h2>
      </div>
      <div className="content-area">
        <div className="subject-semester">
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
            onChange={(e) => {
              setSemester(e.target.value);
              setStudents([]);
            }}
            placeholder="Semester"
          />
          <button onClick={fetchStudents}>Load Students</button>
        </div>
        <div className="sutudens-container">
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
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
