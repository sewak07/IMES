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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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

  const handleChangePassword = async () => {
    if (!teacherEmail || !oldPassword || !newPassword) {
      return alert("Please fill all fields");
    }

    if (newPassword.length < 6) {
      return alert("New password must be at least 6 characters long");
    }

    try {
      const res = await axios.post(
        "http://localhost:9001/api/teacher/change-password",
        {
          email: teacherEmail,
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert(res.data.message);
      
      if (res.data.success) {
        setShowPasswordModal(false);
        setTeacherEmail("");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to change password";
      alert(errorMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const selectedSubject = subjects.find(
    s => Number(s.semester) === Number(semester)
  );

  return (
    <div className={styles.teacherDashboardWrapper}>
      {/* TOP HEADER */}
      <div className={styles.topBar}>
        <h2>{welcome}</h2>
        
        {/* Top Right Icons */}
        <div className={styles.dashboardHeaderTop}>
          <div
            className={styles.actionIcon}
            onClick={() => setShowPasswordModal(true)}
            title="Change Password"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <div
            className={styles.actionIcon}
            onClick={handleLogout}
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
          </div>
        </div>
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

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContainer}>
            <h3>Change Password</h3>
            <input
              type="email"
              placeholder="Email"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
              className={styles.modalInput}
            />
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={styles.modalInput}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalButtons}>
              <button onClick={handleChangePassword}>Save</button>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowPasswordModal(false);
                  setTeacherEmail("");
                  setOldPassword("");
                  setNewPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}