import { useEffect, useState, useRef } from "react";
import Header from "./Header.jsx";
import Stats from "./Stats.jsx";
import InternalExam from "./InternalExam.jsx";
import InternalAssessment from "./InternalAssessment.jsx";
import Analytics from "./Analytics.jsx";
import Footer from "./Footer.jsx";
import styles from "./StudentDashboard.module.css";

export default function StudentDashboard() {
  const token = localStorage.getItem("token");

  const [performanceData, setPerformanceData] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const userMenuRef = useRef(null);

  const maxMarks = {
    assignment1: 3,
    assignment2: 3,
    assignment3: 4,
    internal: 10,
    midTerm: 10,
    attendance: 10,
  };

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await fetch(
          "http://localhost:9001/api/student/performance",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setPerformanceData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPerformance();
  }, [token]);

  /* ---------- CLOSE MENU ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!performanceData) {
    return (
      <div className={styles.studentDashboard}>
        <div className={styles.sdLoading}>Loading dashboard…</div>
      </div>
    );
  }

  const { student, performance } = performanceData;

  /* ---------- CHANGE PASSWORD ---------- */
  const handleChangePassword = async () => {
    setPasswordMsg("");
    try {
      const res = await fetch(
        "http://localhost:9001/api/student/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: student.email,
            currentPassword: oldPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      setPasswordMsg(data.message);
      if (data.success) {
        setOldPassword("");
        setNewPassword("");
        setShowPasswordModal(false);
      }
    } catch {
      setPasswordMsg("Server error");
    }
  };

  return (
    <div className={styles.studentDashboard}>
      <Header
        student={student}
        userMenuRef={userMenuRef}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        showPasswordModal={showPasswordModal}
        setShowPasswordModal={setShowPasswordModal}
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        passwordMsg={passwordMsg}
        handleChangePassword={handleChangePassword}
      />

      <Stats performance={performance} student={student} />
      <InternalExam performance={performance} />
      <InternalAssessment performance={performance} />
      <Analytics performance={performance} />
      <Footer />
    </div>
  );
}
