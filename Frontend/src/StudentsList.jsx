import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentLists() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:9001/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:9001/api/admin/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Student deleted");
      fetchStudents();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error deleting student");
    }
  };

  return (
    <div>
      <h3>All Students</h3>
      {message && <p>{message}</p>}
      <ul>
        {students.map((s) => (
          <li key={s._id}>
            {s.username} ({s.email}) - Semester: {s.semester}{" "}
            <button onClick={() => handleDelete(s._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}