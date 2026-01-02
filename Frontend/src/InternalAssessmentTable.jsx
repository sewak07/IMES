import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./InternalAssessmentTable.module.css";

export default function InternalAssessmentTable({
  students,
  selectedSubject
}) {
  const [marks, setMarks] = useState([]);

  // Initialize marks when students or subject changes
  useEffect(() => {
    if (students && students.length > 0) {
      setMarks(
        students.map((student) => {
          const studentMark =
            student.marks?.find(m => m.subject === selectedSubject) || {};

          return {
            studentId: student._id,
            internal: studentMark.internal || 0,
            midTerm: studentMark.midTerm || 0,

            assignment1: studentMark.assignment1 || 0,
            assignment2: studentMark.assignment2 || 0,
            assignment3: studentMark.assignment3 || 0,

            assignment1Locked: studentMark.assignment1Submitted || false,
            assignment2Locked: studentMark.assignment2Submitted || false,
            assignment3Locked: studentMark.assignment3Submitted || false,

            total: studentMark.total || 0
          };
        })
      );
    } else {
      setMarks([]);
    }
  }, [students, selectedSubject]);

  const handleChange = (index, field, value) => {
    setMarks(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login expired. Please login again.");
    if (!selectedSubject) return alert("Please select a subject first");

    try {
      for (let i = 0; i < marks.length; i++) {
        const m = marks[i];
        const student = students[i];
        if (!m || !student) continue;

        const res = await axios.post(
          "http://localhost:9001/api/teacher/marks",
          {
            studentId: m.studentId,
            subject: selectedSubject,
            semester: student.semester,
            internal: Number(m.internal),
            midTerm: Number(m.midTerm),
            assignment1: Number(m.assignment1),
            assignment2: Number(m.assignment2),
            assignment3: Number(m.assignment3)
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setMarks(prev => {
          const updated = [...prev];
          updated[i].total = res.data.marks.total;

          updated[i].assignment1Locked = res.data.marks.assignment1Submitted;
          updated[i].assignment2Locked = res.data.marks.assignment2Submitted;
          updated[i].assignment3Locked = res.data.marks.assignment3Submitted;

          return updated;
        });
      }

      alert("Internal assessment saved successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save marks");
    }
  };

  return (
    <>
      <table className={styles.internalTable}>
        <thead>
          <tr>
            <th rowSpan="2">Student Name</th>
            <th colSpan="2">Exam</th>
            <th>Attendance</th>
            <th colSpan="4">Assignments</th>
            <th rowSpan="2">Total</th>
          </tr>
          <tr>
            <th>1st Term</th>
            <th>Mid Term</th>
            <th>Marks</th>
            <th>1st</th>
            <th>2nd</th>
            <th>3rd</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student, index) => {
            const attendance = student.attendance?.find(
              a => a.subject === selectedSubject
            );

            const attendanceMarks =
              attendance && attendance.qualified ? attendance.marks : "NQ";

            const assignmentTotal =
              Number(marks[index]?.assignment1 || 0) +
              Number(marks[index]?.assignment2 || 0) +
              Number(marks[index]?.assignment3 || 0);

            return (
              <tr key={student._id}>
                <td>{student.username}</td>

                {/* Internal */}
                <td>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={marks[index]?.internal}
                    onChange={e =>
                      handleChange(index, "internal", e.target.value)
                    }
                    className={styles.smallInput}
                  />
                </td>

                {/* Mid Term */}
                <td>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={marks[index]?.midTerm}
                    onChange={e =>
                      handleChange(index, "midTerm", e.target.value)
                    }
                    className={styles.smallInput}
                  />
                </td>

                {/* Attendance */}
                <td>{attendanceMarks}</td>

                {/* Assignment 1 (0–3) */}
                <td>
                  <select
                    value={marks[index]?.assignment1}
                    disabled={marks[index]?.assignment1Locked}
                    onChange={e =>
                      handleChange(index, "assignment1", Number(e.target.value))
                    }
                    className={styles.smallInput}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </td>

                {/* Assignment 2 (0–3) */}
                <td>
                  <select
                    value={marks[index]?.assignment2}
                    disabled={marks[index]?.assignment2Locked}
                    onChange={e =>
                      handleChange(index, "assignment2", Number(e.target.value))
                    }
                    className={styles.smallInput}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </td>

                {/* Assignment 3 (0–4) */}
                <td>
                  <select
                    value={marks[index]?.assignment3}
                    disabled={marks[index]?.assignment3Locked}
                    onChange={e =>
                      handleChange(index, "assignment3", Number(e.target.value))
                    }
                    className={styles.smallInput}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </td>

                {/* Assignment Total */}
                <td>
                  <input
                    readOnly
                    value={assignmentTotal}
                    className={styles.smallInput}
                  />
                </td>

                {/* Final Total */}
                <td>
                  <input
                    readOnly
                    value={marks[index]?.total}
                    className={styles.smallInput}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className={styles.saveButton} onClick={handleSave}>
        Save Internal Assessment
      </button>
    </>
  );
}
