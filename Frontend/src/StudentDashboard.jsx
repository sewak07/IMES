import { useEffect, useState } from "react";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const token = localStorage.getItem("token");

  const maxMarks = {
    assignment1: 3,
    assignment2: 3,
    assignment3: 4,
    internalPoints: 10,
    midTermPoints: 10,
    attendance: 5,
  };

  useEffect(() => {
    const fetchDashboardAndPerformance = async () => {
      if (!token) {
        alert("No token found. Please login.");
        return;
      }

      try {
        const dashboardRes = await fetch(
          "http://localhost:9001/api/student/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dashboardData = await dashboardRes.json();
        setDashboardMessage(dashboardData.message);

        const performanceRes = await fetch(
          "http://localhost:9001/api/student/performance",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const performanceData = await performanceRes.json();
        setPerformanceData(performanceData);
      } catch (error) {
        console.error(error.message);
        alert("Failed to load dashboard or performance. Check console.");
      }
    };

    fetchDashboardAndPerformance();
  }, [token]);

  if (!performanceData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading your performance data...</p>
      </div>
    );
  }

  const getWidth = (value, max) =>
    typeof value === "number" ? (value / max) * 100 : 0;

  const calculateOverallPercentage = (p) => {
    return ((p.totalAssessment / 40) * 100).toFixed(1);
  };

  const getPerformanceGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "grade-a-plus" };
    if (percentage >= 80) return { grade: "A", color: "grade-a" };
    if (percentage >= 70) return { grade: "B", color: "grade-b" };
    if (percentage >= 60) return { grade: "C", color: "grade-c" };
    return { grade: "D", color: "grade-d" };
  };

  return (
    <div className="dashboard-container">

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <div className="dashboard-header">
        {/* IMES Logo / Name */}
        <div className="imes-logo">IMES</div>

        {/* Welcome Box Centered */}
        <div className="welcome-box centered">
          <h2 className="welcome-title">Welcome! {performanceData.student.username}</h2>
          <div className="semester-info">
            <span>Semester:</span> {performanceData.student.semester}
          </div>
          <p className="dashboard-subtitle">
            Track your academic progress and achievements
          </p>
        </div>
      </div>



      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-label">Total Subjects</span>
            <span className="stat-value">{performanceData.performance.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Qualified</span>
            <span className="stat-value">
              {performanceData.performance.filter((p) => p.isQualified).length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <span className="stat-label">Not Qualified</span>
            <span className="stat-value">
              {performanceData.performance.filter((p) => !p.isQualified).length}
            </span>
          </div>
        </div>
      </div>
    <br></br>
      <h2>Performance</h2>
      {/* Performance Cards Grid */}
      <div className="performance-grid">

        {performanceData.performance.map((p, i) => {
          const overallPercentage = calculateOverallPercentage(p);
          const gradeInfo = getPerformanceGrade(parseFloat(overallPercentage));
          const isSelected = selectedCard === i;

          return (

            <div className="performance-card" key={i}>


              {/* Card Header */}
              <div
                className="card-header"
                onClick={() => setSelectedCard(isSelected ? null : i)}
              >
                <h2 className="subject-title">{p.subject}</h2>
                <div className={`grade-badge ${gradeInfo.color}`}>
                  <span className="grade-letter">{gradeInfo.grade}</span>
                  <span className="grade-percentage">{overallPercentage}%</span>
                </div>
              </div>

              {/* Attendance Section */}
              <div className="attendance-section">
                <div className="section-header">
                  <span className="section-icon">📅</span>
                  <span className="section-title">Attendance Status</span>
                  <span className={`status-badge ${p.isQualified ? "qualified" : "not-qualified"}`}>
                    {p.isQualified ? "✓ Qualified" : "✗ Not Qualified"}
                  </span>
                </div>
                <div className="attendance-bar-wrapper">
                  <div className="attendance-bar">
                    <div
                      className={`attendance-fill ${p.isQualified ? "fill-qualified" : "fill-not-qualified"}`}
                      style={{ width: `${p.attendance.percentage}%` }}
                    >
                      <span className="bar-label">{p.attendance.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <p className="attendance-details">
                  <span className="attendance-fraction">{p.attendance.attendedDays}/{p.attendance.totalDays}</span>
                  <span className="attendance-text">days attended</span>
                </p>
              </div>

              {/* Marks Section */}
              <div className="marks-section">
                <h3 className="marks-section-title">
                  <span className="title-icon">📝</span>
                  Marks Obtained
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
                          style={{ width: `${getWidth(p.marks[term] || 0, 60)}%` }}
                        ></div>
                      </div>
                      <span className="mark-value">{p.marks[term] || 0}/60</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expandable Section */}
              <div className="expandable-section" style={{ display: isSelected ? "block" : "none" }}>

                {/* Internal Assessment Section */}
                <div className="marks-section">
                  <h3 className="marks-section-title">
                    <span className="title-icon">📋</span>
                    Internal Assessment
                  </h3>

                  {["internal", "midTerm", "assignment1", "assignment2", "assignment3", "attendanceMarks"].map((mark, idx) => (
                    <div className="mark-item" key={idx}>
                      <div className="mark-label-container">
                        <span className="mark-label">
                          {mark === "internal" ? "1st Term Points" :
                            mark === "midTerm" ? "2nd Term Points" :
                              mark.includes("assignment") ? `Assignment ${mark.slice(-1)}` :
                                "Attendance Marks"}
                        </span>
                      </div>
                      <div className="mark-bar-container">
                        <div className="mark-bar">
                          <div
                            className={`mark-bar-fill ${mark === "internal" ? "internal-1" :
                              mark === "midTerm" ? "internal-2" :
                                mark.includes("assignment") ? "assignment" :
                                  "attendance-mark"
                              }`}
                            style={{
                              width: `${getWidth(p.marks[mark], maxMarks[mark] || maxMarks.attendance)}%`
                            }}
                          ></div>
                        </div>
                        <span className="mark-value">{p.marks[mark]}/{maxMarks[mark] || maxMarks.attendance}</span>
                      </div>
                    </div>
                  ))}

                  {/* Total Assessment */}
                  <div className="total-assessment">
                    <span className="total-label">Total Assessment Marks</span>
                    <strong className="total-value">{p.totalAssessment}/40</strong>
                  </div>
                </div>
              </div>

              {/* Expand Indicator */}
              <div
                className="expand-indicator"
                onClick={() => setSelectedCard(isSelected ? null : i)}
              >
                {isSelected ? "Click to collapse ▲" : "Click to expand ▼"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
