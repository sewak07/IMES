import "./TeacherLists.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBox from "./SearchBox";

export default function TeachersLists() {
  const [teachers, setTeachers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:9001/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers || []);
      fetchTeachers();
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

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

  const handleEditClick = (teacher) => {
    setEditingId(teacher._id);
    setEditedData({
      username: teacher.username,
      email: teacher.email,
      subjects: teacher.subjects.map(s => ({ ...s }))
    });
  };

  const handleInputChange = (field, value, index = null) => {
    if (field === "subjects") {
      const updatedSubjects = [...editedData.subjects];
      updatedSubjects[index].name = value.name ?? updatedSubjects[index].name;
      updatedSubjects[index].semester = value.semester ?? updatedSubjects[index].semester;
      setEditedData(prev => ({ ...prev, subjects: updatedSubjects }));
    } else {
      setEditedData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:9001/api/admin/teacher/${id}`,
        editedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditedData({});
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating teacher");
    }
  };

  const filteredTeachers = teachers.filter(
    (s) =>
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className="teacher-table-wrapper">
      <h3>All Teachers</h3>
      <SearchBox
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        placeholder="Search by name or email..."
      />
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subjects</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTeachers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No teachers found
                </td>
              </tr>
            ) : (
              currentTeachers.map((t) => (
                <tr key={t._id}>
                  <td data-label="Name">
                    {editingId === t._id ? (
                      <input
                        type="text"
                        value={editedData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                      />
                    ) : (
                      t.username
                    )}
                  </td>
                  <td data-label="Email">
                    {editingId === t._id ? (
                      <input
                        type="email"
                        value={editedData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    ) : (
                      t.email
                    )}
                  </td>
                  <td data-label="Subjects">
                    {editingId === t._id ? (
                      editedData.subjects.map((s, i) => (
                        <div key={i} style={{ marginBottom: "5px" }}>
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) =>
                              handleInputChange("subjects", { name: e.target.value }, i)
                            }
                            placeholder="Subject Name"
                          />
                          &nbsp;
                          <input
                            type="text"
                            value={s.semester}
                            onChange={(e) =>
                              handleInputChange("subjects", { semester: e.target.value }, i)
                            }
                            placeholder="Semester"
                          />
                        </div>
                      ))
                    ) : t.subjects?.length ? (
                      t.subjects.map(s => `${s.name} (Sem: ${s.semester ?? "N/A"})`).join(", ")
                    ) : (
                      "No subjects"
                    )}
                  </td>
                  <td data-label="Action">
                    {editingId === t._id ? (
                      <>
                        <button className="update-btn" onClick={() => handleSave(t._id)}>Save</button>
                        &nbsp; 
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="update-btn" onClick={() => handleEditClick(t)}>Edit</button>
                        &nbsp; 
                        <button className="delete-btn" onClick={() => handleDelete(t._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}
