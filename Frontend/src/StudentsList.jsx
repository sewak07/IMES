import "./StudentList.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBox from "./SearchBox";


export default function StudentLists() {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");


  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:9001/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
      fetchStudents();
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
      fetchStudents();
      alert("Student deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting student");
    }
  };

  const handleEditClick = (student) => {
    setEditingId(student._id);
    setEditedData({
      username: student.username,
      email: student.email,
      semester: student.semester,
    });
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:9001/api/admin/student/${id}`,
        editedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditedData({});
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating student");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className="student-table-wrapper">
      <h3>All Students</h3>
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
              <th>Semester</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((s) => (
              <tr key={s._id}>
                <td data-label="Name">
                  {editingId === s._id ? (
                    <input
                      type="text"
                      value={editedData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                    />
                  ) : (
                    s.username
                  )}
                </td>
                <td data-label="Email">
                  {editingId === s._id ? (
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  ) : (
                    s.email
                  )}
                </td>
                <td data-label="Semester">
                  {editingId === s._id ? (
                    <input
                      type="text"
                      value={editedData.semester}
                      onChange={(e) => handleInputChange("semester", e.target.value)}
                    />
                  ) : (
                    s.semester
                  )}
                </td>
                <td data-label="Action">
                  {editingId === s._id ? (
                    <>
                      <button className="update-btn" onClick={() => handleSave(s._id)}>Save</button>
                      &nbsp;
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="update-btn" onClick={() => handleEditClick(s)}>Edit</button>
                      &nbsp;
                      <button className="delete-btn" onClick={() => handleDelete(s._id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
