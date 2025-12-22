import { useState, useEffect } from "react";
import axios from "axios";
import "./StudentRow.css";

export default function StudentRow({ student, subject, token }) {
  const existingAttendance = student.attendence?.find(
    a => a.subject === subject.name
  );

  const [attendance, setAttendance] = useState(
    existingAttendance || { subject: subject.name, attendend: 0, total: 0 }
  );

  const [loading, setLoading] = useState(false);

  const markAttendance = async (present) => {
    try {
      setLoading(true);

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
    } catch {
      alert("Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-row">
      <div className="student-info">
        <strong>{student.username}</strong> — {subject.name}
      </div>

      <div className="attendance-buttons">
        <button className="present" disabled={loading} onClick={() => markAttendance(true)}>
          Present
        </button>
        <button
          className="absent"
          disabled={loading}
          onClick={() => markAttendance(false)}
          style={{ marginLeft: "10px" }}
        >
          Absent
        </button>
      </div>
      
      <div className="attendance-info">
        {attendance && (
          <p>
            Attendance: {attendance.attendend} / {attendance.total} days
          </p>
        )}
      </div>
    </div>

  );
}
