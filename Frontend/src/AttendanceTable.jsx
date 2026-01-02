import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AttendanceTable.module.css";

export default function AttendanceTable({ students, subject, semester, token, onAttendanceUpdate }) {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    if (!students || students.length === 0) return;

    // Initialize all students as present by default
    const initial = students.map(student => {
      const existing = (student.attendance || []).find(a => a.subject === subject.name);
      return {
        id: student._id,
        name: student.username,
        present: true, // default checked
        attendedDays: existing ? existing.attendedDays : 0,
        totalDays: existing ? existing.totalDays : 0
      };
    });
    setAttendanceData(initial);
  }, [subject, students]);

  const togglePresent = (studentId) => {
    setAttendanceData(prev =>
      prev.map(a => {
        if (a.id === studentId) return { ...a, present: !a.present };
        return a;
      })
    );
  };

  const saveAttendance = async () => {
    try {
      const updatedData = [...attendanceData];

      for (let i = 0; i < attendanceData.length; i++) {
        const a = attendanceData[i];

        const res = await axios.put(
          "http://localhost:9001/api/teacher/attendance",
          {
            studentId: a.id,
            subject: subject.name,
            semester,
            present: a.present
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const backendAttendance = res.data.attendance;

        // After saving, reset all checkboxes to checked
        updatedData[i] = {
          ...updatedData[i],
          present: true, // reset checkbox to checked
          attendedDays: backendAttendance.attendedDays,
          totalDays: backendAttendance.totalDays
        };

        onAttendanceUpdate?.(a.id, backendAttendance);
      }

      setAttendanceData(updatedData);
      alert("Attendance saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance");
    }
  };

  return (
    <div>
      <table className={styles.attendanceTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name (Present/Total)</th>
            <th>Present</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.name} ({student.attendedDays}/{student.totalDays})</td>
              <td>
                <input
                  type="checkbox"
                  checked={student.present}
                  onChange={() => togglePresent(student.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.saveButton} onClick={saveAttendance}>
        Save Attendance
      </button>
    </div>
  );
}
