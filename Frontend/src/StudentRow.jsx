import { useState, useEffect } from "react";
import axios from "axios";
import "./StudentRow.css";

export default function StudentRow({
  student,
  subject,
  token,
  onAttendanceUpdate,
  onMarksUpdate
}) {

  const existingAttendance =
    (student.attendance || []).find(a => a.subject === subject.name) || {
      subject: subject.name,
      attendedDays: 0,
      totalDays: 0,
      percentage: 0,
      marks: 0
    };

  const [attendance, setAttendance] = useState(existingAttendance);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const existingMarks =
    (student.marks || []).find(m => m.subject === subject.name) || {
      internal: "",
      midTerm: "",
      assignment: "",
      labReport: "",
      practical: "",
      viva: "",
      total: 0
    };

  const [marks, setMarks] = useState(existingMarks);
  const [marksLoading, setMarksLoading] = useState(false);

  // 🔴 NOT QUALIFIED LOGIC
  const notQualified =
    attendance.totalDays > 0 && attendance.percentage < 80;

  // 🔁 KEEP MARKS IN SYNC AFTER ATTENDANCE UPDATE
  useEffect(() => {
    if (existingMarks.total !== undefined) {
      setMarks(prev => ({ ...prev }));
    }
  }, [attendance]);

  const markAttendance = async (present) => {
    setAttendanceLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:9001/api/teacher/attendance",
        {
          studentId: student._id,
          subject: subject.name,
          semester: subject.semester,
          present
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendance(res.data.attendance);
      onAttendanceUpdate?.(student._id, res.data.attendance);

    } catch (err) {
      console.error(err);
      alert("Failed to mark attendance");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarksChange = (e) => {
    const { name, value } = e.target;
    setMarks(prev => ({
      ...prev,
      [name]: value === "" ? "" : Number(value)
    }));
  };

  const saveMarks = async () => {
    setMarksLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:9001/api/teacher/marks",
        {
          studentId: student._id,
          subject: subject.name,
          semester: subject.semester,
          internal: marks.internal || 0,
          midTerm: marks.midTerm || 0,
          assignment: marks.assignment || 0,
          labReport: marks.labReport || 0,
          practical: marks.practical || 0,
          viva: marks.viva || 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMarks(res.data.marks);
      onMarksUpdate?.(student._id, res.data.marks);

    } catch (err) {
      console.error(err);
      alert("Failed to save marks");
    } finally {
      setMarksLoading(false);
    }
  };

  return (
    <div className="student-row">
      <div className="header">
        <div className="student-info">
          <strong>{student.username}</strong>
          <span className="subject">{subject.name}</span>
        </div>

        <div className="attendance-status">
          Attendance:
          <strong>
            {" "}
            {attendance.attendedDays ?? 0} / {attendance.totalDays ?? 0}
          </strong>
          ({attendance.percentage?.toFixed(1) ?? 0}%)

          {notQualified && (
            <span style={{
              marginLeft: "10px",
              padding: "3px 8px",
              background: "#c62828",
              color: "#fff",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              Not Qualified
            </span>
          )}
        </div>
      </div>

      <div className="attendance-buttons">
        <button
          className="present"
          disabled={attendanceLoading}
          onClick={() => markAttendance(true)}
        >
          Present
        </button>
        <button
          className="absent"
          disabled={attendanceLoading}
          onClick={() => markAttendance(false)}
        >
          Absent
        </button>
      </div>

      <div className="marks-section">
        <h4>Marks Entry</h4>

        <div className="marks-cards">
          <div className="marks-card">
            <h5>Internal Exams</h5>
            <div className="marks-grid">
              <div>
                <label>First Term</label>
                <input
                  type="number"
                  name="internal"
                  value={marks.internal}
                  onChange={handleMarksChange}
                />
              </div>
              <div>
                <label>Mid Term</label>
                <input
                  type="number"
                  name="midTerm"
                  value={marks.midTerm}
                  onChange={handleMarksChange}
                />
              </div>
            </div>
          </div>

          <div className="marks-card">
            <h5>Internal Assessments</h5>
            <div className="marks-grid">
              <div>
                <label>Assignments</label>
                <input
                  type="number"
                  name="assignment"
                  value={marks.assignment}
                  onChange={handleMarksChange}
                />
              </div>
              <div>
                <label>Lab Reports</label>
                <input
                  type="number"
                  name="labReport"
                  value={marks.labReport}
                  onChange={handleMarksChange}
                />
              </div>
              <div>
                <label>Practical Exams</label>
                <input
                  type="number"
                  name="practical"
                  value={marks.practical}
                  onChange={handleMarksChange}
                />
              </div>
              <div>
                <label>Viva</label>
                <input
                  type="number"
                  name="viva"
                  value={marks.viva}
                  onChange={handleMarksChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="total-marks">
          Total Internal Assessment Marks: <strong>{marks.total ?? 0}</strong>
        </div>

        <br />

        <button
          className="save-btn"
          disabled={marksLoading}
          onClick={saveMarks}
        >
          Save Marks
        </button>
      </div>
    </div>
  );
}
