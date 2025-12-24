import { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const token = localStorage.getItem("token");

 
  const maxMarks = {
    assignment: 5,
    labReport: 10,
    practical: 15,
    viva: 5,
    attendance: 5,
  };

  useEffect(() => {
    const fetchDashboardAndPerformance = async () => {
      if (!token) {
        alert("No token found. Please login.");
        return;
      }

      try {
        const dashboardRes = await axios.get(
          "http://localhost:9001/api/student/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardMessage(dashboardRes.data.message);

        const performanceRes = await axios.get(
          "http://localhost:9001/api/student/performance",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPerformanceData(performanceRes.data);
      } catch (error) {
        console.error(error.response?.data || error.message);
        alert("Failed to load dashboard or performance. Check console.");
      }
    };

    fetchDashboardAndPerformance();
  }, [token]);

  if (!performanceData) return <p className="loading">Loading...</p>;

  const getWidth = (obtained, max) => (obtained / max) * 100;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">{dashboardMessage}</h1>
      <p className="semester">Semester {performanceData.student.semester}</p>

      <div className="performance-grid">
        {performanceData.performance.map((p, i) => {
          const totalAssessment =
            p.marks.assignment +
            p.marks.labReport +
            p.marks.practical +
            p.marks.viva +
            (p.attendance.percentage * maxMarks.attendance) / 100;

          return (
            <div className="card" key={i}>
              <h2 className="subject-title">{p.subject}</h2>

              
              <div className="attendance">
                <p className="attendance-label">Attendance</p>
                <div className="attendance-bar">
                  <div
                    className={`attendance-fill ${
                      p.qualified ? "qualified" : "not-qualified"
                    }`}
                    style={{ width: `${p.attendance.percentage}%` }}
                  ></div>
                </div>
                <p className="attendance-text">
                  {p.attendance.attendedDays}/{p.attendance.totalDays} (
                  {p.attendance.percentage.toFixed(1)}%){" "}
                  <span
                    className={p.qualified ? "qualified-text" : "not-qualified-text"}
                  >
                    {p.qualified ? "Qualified" : "Not Qualified"}
                  </span>
                </p>
              </div>

              
              <div className="marks-section">
                <h3>Internal Examination</h3>
                <div className="marks-bar">
                  <div className="mark-item">
                    <span>Internal:</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill internal"
                        style={{ width: `${getWidth(p.marks.internal, 60)}%` }}
                      ></div>
                    </div>
                    <span>{p.marks.internal}/60</span>
                  </div>
                  <div className="mark-item">
                    <span>Mid Term:</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill midterm"
                        style={{ width: `${getWidth(p.marks.midTerm, 60)}%` }}
                      ></div>
                    </div>
                    <span>{p.marks.midTerm}/60</span>
                  </div>
                </div>
              </div>

              
              <div className="marks-section">
                <h3>Internal Assessment</h3>
                <div className="marks-bar">
                  <div className="mark-item">
                    <span>Assignment:</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill assignment"
                        style={{ width: `${getWidth(p.marks.assignment, maxMarks.assignment)}%` }}
                      ></div>
                    </div>
                    <span>{p.marks.assignment}/5</span>
                  </div>
                  <div className="mark-item">
                    <span>Lab Report:</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill lab"
                        style={{ width: `${getWidth(p.marks.labReport, maxMarks.labReport)}%` }}
                      ></div>
                    </div>
                    <span>{p.marks.labReport}/10</span>
                  </div>
                  <div className="mark-item">
                    <span>Practical:</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill practical"
                        style={{ width: `${getWidth(p.marks.practical, maxMarks.practical)}%` }}
                      ></div>
                    </div>
                    <span>{p.marks.practical}/15</span>
                  </div>
                  <div className="mark-item">
                    <span>Viva:</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill viva"
                        style={{ width: `${getWidth(p.marks.viva, maxMarks.viva)}%` }}
                      ></div>
                    </div>
                    <span>{p.marks.viva}/5</span>
                  </div>
                  <div className="mark-item">
                    <span>Attendance:</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill attendance-mark"
                        style={{
                          width: `${getWidth((p.attendance.percentage * maxMarks.attendance) / 100, maxMarks.attendance)}%`,
                        }}
                      ></div>
                    </div>
                    <span>{((p.attendance.percentage * maxMarks.attendance) / 100).toFixed(1)}/5</span>
                  </div>
                  <div className="mark-item total-assessment">
                    <span>Total Internal Assessment Marks:</span>
                    <strong>{totalAssessment.toFixed(1)}/40</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
