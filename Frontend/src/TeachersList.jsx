import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBox from "./SearchBox";
import "./TeacherLists.css";

export default function TeachersLists() {
  const [teachers, setTeachers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:9001/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers || []);
      fetchTeachers();
    } catch (err) {
      console.log("Error fetching teachers:", err);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingId(teacher._id);
    setEditedData({
      username: teacher.username,
      email: teacher.email,
      subjects: teacher.subjects.map(s => ({ ...s })),
    });
  };

  const handleInputChange = (field, value, index = null) => {
    if (field === "subjects") {
      const newSubjects = [...editedData.subjects];
      if (value.name !== undefined) newSubjects[index].name = value.name;
      if (value.semester !== undefined) newSubjects[index].semester = value.semester;
      setEditedData({ ...editedData, subjects: newSubjects });
    } else {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  const addNewSubject = () => {
    const newSubjects = [...(editedData.subjects || []), { name: "", semester: "" }];
    setEditedData({ ...editedData, subjects: newSubjects });
  };

  const removeSubject = (index) => {
    const newSubjects = editedData.subjects.filter((_, i) => i !== index);
    setEditedData({ ...editedData, subjects: newSubjects });
  };

  const handleSave = async (id) => {
    try {
      const dataToSend = {
        ...editedData,
        subjects: editedData.subjects.filter(s => s.name && s.name.trim() !== "")
      };
      await axios.put(`http://localhost:9001/api/admin/teacher/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingId(null);
      setEditedData({});
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating teacher");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await axios.delete(`http://localhost:9001/api/admin/teacher/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting teacher");
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  return (
    <div className="teacher-table-wrapper">
      <h3>All Teachers</h3>
      <SearchBox
        value={searchTerm}
        onChange={value => { setSearchTerm(value); setCurrentPage(1); }}
        placeholder="Search by name or email..."
      />
      <table>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Subjects</th>
            <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentTeachers.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No teachers found</td>
            </tr>
          ) : (
            currentTeachers.map(t => (
              <tr key={t._id}>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  {editingId === t._id ? (
                    <input
                      type="text"
                      value={editedData.username}
                      onChange={e => handleInputChange("username", e.target.value)}
                    />
                  ) : t.username}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  {editingId === t._id ? (
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={e => handleInputChange("email", e.target.value)}
                    />
                  ) : t.email}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  {editingId === t._id ? (
                    <div>
                      {editedData.subjects.map((s, i) => (
                        <div key={i} style={{ marginBottom: "5px" }}>
                          <input
                            type="text"
                            placeholder="Subject Name"
                            value={s.name}
                            onChange={e => handleInputChange("subjects", { name: e.target.value }, i)}
                          />
                          <input
                            type="text"
                            placeholder="Semester"
                            value={s.semester}
                            onChange={e => handleInputChange("subjects", { semester: e.target.value }, i)}
                          />
                          <button onClick={() => removeSubject(i)}>Remove</button>
                        </div>
                      ))}
                      <button onClick={addNewSubject}>+ Add Subject</button>
                    </div>
                  ) : (
                    t.subjects.length > 0 ? t.subjects.map(s => `${s.name} (Sem: ${s.semester || "N/A"})`).join(", ") : "No subjects"
                  )}
                </td>
                <td>
                  {editingId === t._id ? (
                    <>
                      <button onClick={() => handleSave(t._id)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(t)}>Edit</button>
                      <button onClick={() => handleDelete(t._id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ fontWeight: currentPage === i + 1 ? "bold" : "normal" }}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
