import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TeachersLists() {
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:9001/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this teacher?")) return;
    try {
      await axios.delete(`http://localhost:9001/api/admin/teacher/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Teacher deleted");
      fetchTeachers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error deleting teacher");
    }
  };

  return (
    <div>
      <h3>All Teachers</h3>
      {message && <p>{message}</p>}
      <ul>
        {teachers.map((t) => (
          <li key={t._id}>
            {t.username} ({t.email}) - Subjects: {t.subjects.map((s) => s.name).join(", ")}{" "}
            <button onClick={() => handleDelete(t._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
