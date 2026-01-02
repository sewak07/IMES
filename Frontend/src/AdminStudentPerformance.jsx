import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./AdminStudentPerformance.css";

export default function AdminStudentPerformance() {
  const { id } = useParams();
  const [performance, setPerformance] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:9001/api/admin/student/performance/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStudent(res.data.student || null);
        setPerformance(res.data.performance || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch performance");
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [id, token]);

  if (loading)
    return <p className="status-msg">Loading...</p>;
  if (error)
    return <p className="status-msg error">{error}</p>;
  if (!student)
    return <p className="status-msg">Student not found.</p>;
  if (!performance.length)
    return <p className="status-msg">No performance data available.</p>;

  return (
    <div className="performance-wrapper">
      <header className="performance-header">
        <h2>{student.username}</h2>
        <p>
          Semester {student.semester} | Program: {student.faculty}
        </p>
      </header>

      <div className="cards-grid">
        {performance.map((p, idx) => {
          const totalAssessment =
            (p.points?.firstTerm ?? 0) +
            (p.points?.secondTerm ?? 0) +
            (p.assignments?.assignment1 ?? 0) +
            (p.assignments?.assignment2 ?? 0) +
            (p.assignments?.assignment3 ?? 0) +
            (p.attendanceMarks ?? 0);

          return (
            <div key={idx} className="performance-card">
              <h3>{p.subject}</h3>

              <div className="row">
                <span>Attendance:</span>
                <span>
                  {p.attendance?.attendedDays ?? 0}/
                  {p.attendance?.totalDays ?? 0} (
                  {(p.attendance?.percentage ?? 0).toFixed(1)}%) -{" "}
                  <span className={p.attendance?.qualified ? "qualified" : "not-qualified"}>
                    {p.attendance?.qualified ? "Qualified" : "Not Qualified"}
                  </span>
                </span>
              </div>

              <div className="row">
                <span>Attendance Marks:</span>
                <span>{p.attendanceMarks ?? 0}/10</span>
              </div>

              <div className="row">
                <span>1st Term:</span>
                <span>{p.marks?.firstTerm ?? 0} | Points: {p.points?.firstTerm ?? 0}/10</span>
              </div>

              <div className="row">
                <span>2nd Term:</span>
                <span>{p.marks?.secondTerm ?? 0} | Points: {p.points?.secondTerm ?? 0}/10</span>
              </div>

              <div className="row assignments">
                <span>Assignments:</span>
                <span>
                  {p.assignments?.assignment1 ?? 0}/{p.assignments?.assignment1Max ?? 0},{" "}
                  {p.assignments?.assignment2 ?? 0}/{p.assignments?.assignment2Max ?? 0},{" "}
                  {p.assignments?.assignment3 ?? 0}/{p.assignments?.assignment3Max ?? 0}
                </span>
              </div>

              <div className="total-assessment">
                Total Assessment: <strong>{totalAssessment}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
