import { useState } from "react";
import AddStudent from "./AddStudent.jsx";
import AddTeacher from "./AddTeacher.jsx";
import StudentsList from "./StudentsList.jsx";
import TeachersList from "./TeachersList.jsx";
import ChangePassword from "./ChangePassword.jsx";

export default function AdminDashboard() {
  const [tab, setTab] = useState("students");

  const downloadReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not logged in!");

    try {
      const res = await fetch(
        "http://localhost:9001/api/admin/download/students",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to download report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "students_report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        <button onClick={() => setTab("students")}>Students</button>
        <button onClick={() => setTab("teachers")}>Teachers</button>
        <button onClick={() => setTab("password")}>Change Password</button>
        <button onClick={downloadReports}>Download Reports</button>
      </div>

      {tab === "students" && (
        <div>
          <AddStudent />
          <StudentsList />
        </div>
      )}

      {tab === "teachers" && (
        <div>
          <AddTeacher />
          <TeachersList />
        </div>
      )}

      {tab === "password" && <ChangePassword />}
    </div>
  );
}
