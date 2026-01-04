import { useEffect, useState } from "react";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const token = localStorage.getItem("token");

  const maxMarks = {
    assignment1: 3,
    assignment2: 3,
    assignment3: 4,
    internal: 10,
    midTerm: 10,
    attendance: 5,
  };

  const getWidth = (value, max) =>
    typeof value === "number" ? (value / max) * 100 : 0;

  const calculateOverallPercentage = (p) => {
    if (p.totalAssessment === "NQ") return "NQ";

    const maxTotal =
      maxMarks.internal +
      maxMarks.midTerm +
      maxMarks.assignment1 +
      maxMarks.assignment2 +
      maxMarks.assignment3 +
      maxMarks.attendance;

    return ((p.totalAssessment / maxTotal) * 100).toFixed(1);
  };

  const getPerformanceGrade = (percentage) => {
    if (percentage === "NQ") return { grade: "NQ", color: "not-qualified" };
    const pct = parseFloat(percentage);
    if (pct >= 90) return { grade: "A+", color: "grade-a-plus" };
    if (pct >= 80) return { grade: "A", color: "grade-a" };
    if (pct >= 70) return { grade: "B", color: "grade-b" };
    if (pct >= 60) return { grade: "C", color: "grade-c" };
    return { grade: "D", color: "grade-d" };
  };

  useEffect(() => {
    const fetchDashboardAndPerformance = async () => {
      if (!token) return alert("No token found. Please login.");
      try {
        const dashboardRes = await fetch(
          "http://localhost:9001/api/student/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardMessage((await dashboardRes.json()).message);

        const performanceRes = await fetch(
          "http://localhost:9001/api/student/performance",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPerformanceData(await performanceRes.json());
      } catch (error) {
        console.error(error.message);
        alert("Failed to load dashboard or performance. Check console.");
      }
    };

    fetchDashboardAndPerformance();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const toggleCard = (i) => {
    setExpandedCards((prev) => ({
      ...prev,
      [i]: !prev[i],
    }));
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword)
      return alert("Enter both old and new passwords");

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
            email: performanceData.student.email,
            oldPassword,
            newPassword,
          }),
        }
      );
      const data = await res.json();
      alert(data.message);
      if (data.success) {
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to change password");
    }
  };

  if (!performanceData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading your performance data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ===== HEADER ===== */}
      <div className="dashboard-header-top">
        <h1 className="imes-logo">IMES</h1>
        <div className="header-icons">
          {/* Change Password Icon */}
          <div
            className="action-icon"
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

          {/* Logout Icon */}
          <div className="action-icon" onClick={handleLogout} title="Logout">
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

      {/* ===== DASHBOARD HEADER ===== */}
      <div className="dashboard-header">
        <div className="welcome-box centered">
          <h2 className="welcome-title">
            Welcome! {performanceData.student.username}
          </h2>
          <div className="semester-info">
            <span>Semester:</span> {performanceData.student.semester}
          </div>
          <p className="dashboard-subtitle">
            Track your academic progress and achievements
          </p>
        </div>
      </div>

      {/* ===== STATS OVERVIEW ===== */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-label">Total Subjects: </span>
            <span className="stat-value">{performanceData.performance.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Qualified: </span>
            <span className="stat-value">
              {performanceData.performance.filter((p) => p.isQualified).length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <span className="stat-label">Not Qualified: </span>
            <span className="stat-value">
              {performanceData.performance.filter((p) => !p.isQualified).length}
            </span>
          </div>
        </div>
      </div>
      {/* ===== PERFORMANCE GRID ===== */}
      <div  style={{ marginTop: "5rem" }}>
        <h2>Performance</h2>
        <div className="performance-grid">
          {performanceData.performance.map((p, i) => {
            const overallPercentage = calculateOverallPercentage(p);
            const gradeInfo = getPerformanceGrade(overallPercentage);
            const isSelected = expandedCards[i];

            return (
              <div
                key={i}
                className={`performance-card ${!p.isQualified ? "not-qualified" : ""}`}
              >
                <div className="card-header" onClick={() => toggleCard(i)}>
                  <div className="subject-teacher">
                    <h2 className="subject-title">{p.subject}</h2>
                    <p className="teacher-name">👨‍🏫 {p.teacherName}</p>
                  </div>
                  <div className={`grade-badge ${gradeInfo.color}`}>
                    <span className="grade-letter">{gradeInfo.grade}</span>
                    <span className="grade-percentage">
                      {overallPercentage === "NQ" ? "NQ" : `${overallPercentage}%`}
                    </span>
                  </div>
                </div>

                <div
                  className="expandable-section"
                  style={{ display: isSelected ? "block" : "none" }}
                >
                  {/* ATTENDANCE SECTION */}
                  <div className="attendance-section">
                    <div className="section-header">
                      <span className="section-icon">📅</span>
                      <span className="section-title">Attendance Status</span>
                      <span
                        className={`status-badge ${p.isQualified ? "qualified" : "not-qualified"}`}
                      >
                        {p.isQualified ? "✓ Qualified" : "✗ Not Qualified"}
                      </span>
                    </div>
                    <div className="attendance-bar-wrapper">
                      <div className="attendance-bar">
                        <div
                          className={`attendance-fill ${p.isQualified ? "fill-qualified" : "fill-not-qualified"}`}
                          style={{ width: `${p.attendance.percentage.toFixed(1)}%` }}
                        >
                          <span className="bar-label">{p.attendance.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="attendance-details">
                      <span className="attendance-fraction">
                        {p.attendance.attendedDays}/{p.attendance.totalDays}
                      </span>
                      <span className="attendance-text">days attended</span>
                    </p>
                  </div>

                  {/* MARKS SECTION */}
                  <div className="marks-section">
                    <h3 className="marks-section-title">
                      <span className="title-icon">📝</span>Marks Obtained
                    </h3>
                    {["rawInternal", "rawMidTerm"].map((term, idx) => (
                      <div className="mark-item" key={idx}>
                        <div className="mark-label-container">
                          <span className="mark-label">{term === "rawInternal" ? "1st Term" : "2nd Term"}</span>
                        </div>
                        <div className="mark-bar-container">
                          <div className="mark-bar">
                            <div
                              className={`mark-bar-fill ${term === "rawInternal" ? "term-1" : "term-2"}`}
                              style={{ width: `${getWidth(p.marks[term] || 0, term === "rawInternal" ? maxMarks.internal : maxMarks.midTerm)}%` }}
                            ></div>
                          </div>
                          <span className="mark-value">{p.marks[term] || 0}/{term === "rawInternal" ? maxMarks.internal : maxMarks.midTerm}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* INTERNAL ASSESSMENT */}
                  <div className="marks-section">
                    <h3 className="marks-section-title">
                      <span className="title-icon">📋</span>Internal Assessment
                    </h3>
                    {["internal", "midTerm", "assignment1", "assignment2", "assignment3", "attendanceMarks"].map((mark, idx) => (
                      <div className="mark-item" key={idx}>
                        <div className="mark-label-container">
                          <span className="mark-label">
                            {mark === "internal"
                              ? "1st Term Points"
                              : mark === "midTerm"
                                ? "2nd Term Points"
                                : mark.includes("assignment")
                                  ? `Assignment ${mark.slice(-1)}`
                                  : "Attendance Marks"}
                          </span>
                        </div>
                        <div className="mark-bar-container">
                          <div className="mark-bar">
                            <div
                              className={`mark-bar-fill ${mark === "internal"
                                ? "internal-1"
                                : mark === "midTerm"
                                  ? "internal-2"
                                  : mark.includes("assignment")
                                    ? "assignment"
                                    : "attendance-mark"}`}
                              style={{ width: `${getWidth(p.marks[mark], maxMarks[mark] || maxMarks.attendance)}%` }}
                            ></div>
                          </div>
                          <span className="mark-value">{p.marks[mark]}/{maxMarks[mark] || maxMarks.attendance}</span>
                        </div>
                      </div>
                    ))}
                    <div className="total-assessment">
                      <span className="total-label">Total Assessment Marks</span>
                      <strong className="total-value">{p.totalAssessment}/40</strong>
                    </div>
                  </div>

                </div>

                <div className="expand-indicator" onClick={() => toggleCard(i)}>
                  {isSelected ? "Click to collapse ▲" : "Click to expand ▼"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== CHANGE PASSWORD MODAL ===== */}
      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleChangePassword}>Save</button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowPasswordModal(false);
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

      {/* ===== PRIVACY POLICY MODAL ===== */}
      {showPrivacyModal && (
        <div className="modal-backdrop">
          <div className="modal-container privacy-modal">
            <h3>Privacy Policy</h3>
            <div className="privacy-content">
              <p>
                At Mechi Multiple Campus, your privacy and data security are important. This dashboard only stores necessary student information such as your username, semester, attendance, and assessment marks to provide academic progress tracking. Your data is kept secure and will never be shared with unauthorized third parties.
              </p>
              <p>
                All passwords are encrypted and transmitted securely. By using this dashboard, you consent to the processing and storage of your academic information for educational purposes.
              </p>
              <p>
                For more details, visit our <a href="https://mechicampus.edu.np" target="_blank" rel="noopener noreferrer">official website</a>.
              </p>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowPrivacyModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Mechi Multiple Campus. All rights reserved.</p>
          <p>
            Visit us:{" "}
            <a
              href="https://mechicampus.edu.np"
              target="_blank"
              rel="noopener noreferrer"
            >
              mechicampus.edu.np
            </a>
          </p>
          <p>
            <span className="privacy-link" onClick={() => setShowPrivacyModal(true)}>
              Privacy Policy
            </span>
          </p>
          <p>
            Designed with ❤️ by{" "}
            <a
              href="https://yourportfolio1.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sewak Dhakal
            </a>{" "}
            and{" "}
            <a
              href="https://yourportfolio2.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nischal Dahal
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
