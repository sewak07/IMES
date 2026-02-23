import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./DownloadReports.module.css";

export default function DownloadReports() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 500; 
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:9001/api/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch students");
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.username.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
      (faculty ? s.faculty.toLowerCase() === faculty.toLowerCase() : true)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / studentsPerPage);
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filtered.slice(indexOfFirst, indexOfLast);

  const download = async (id, username) => {
    try {
      const res = await fetch(`http://localhost:9001/api/admin/download/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}_performance.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className={styles.downloadWrapper}>
      <h2>Admin: Students</h2>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={faculty} onChange={(e) => setFaculty(e.target.value)}>
          <option value="">All Programs</option>
          <option value="bca">BCA</option>
          <option value="csit">CSIT</option>
          <option value="bba">BBA</option>
          <option value="bsc">BSC</option>
          <option value="bim">BIM</option>
        </select>
      </div>

      <table className={styles.studentsTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Semester</th>
            <th>Program</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentStudents.map((s) => (
            <tr key={s._id}>
              <td data-label="Name">{s.username}</td>
              <td data-label="Email">{s.email}</td>
              <td data-label="Semester">{s.semester}</td>
              <td data-label="Program">{s.faculty}</td>
              <td data-label="Action">
                <button
                  className={`${styles.actionButton} ${styles.viewBtn}`}
                  onClick={() => navigate(`/admin/student/${s._id}`)}
                >
                  View
                </button>
                <button
                  className={`${styles.actionButton} ${styles.downloadBtn}`}
                  onClick={() => download(s._id, s.username)}
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
          {currentStudents.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>

     {totalPages > 1 && (
        <div className="pagination">
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