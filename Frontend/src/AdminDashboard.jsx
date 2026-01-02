import "./AdminDashboard.css";
import { useState } from "react";
import AddStudent from "./AddStudent.jsx";
import AddTeacher from "./AddTeacher.jsx";
import StudentsList from "./StudentsList.jsx";
import TeachersList from "./TeachersList.jsx";
import ChangePassword from "./ChangePassword.jsx";
import DownloadReports from "./DownloadReports.jsx"; 

export default function AdminDashboard() {
  const [tab, setTab] = useState("students");

  return (
    <div className="dashboard-wrapper">
      <div className="top-bar">
        <h1>Welcome Admin!</h1>
      </div>

      <div className="sidebar">
        <button onClick={() => setTab("students")}>Students</button>
        <button onClick={() => setTab("teachers")}>Teachers</button>
        <button onClick={() => setTab("password")}>Change Password</button>
        <button onClick={() => setTab("download")}>Download Reports</button>
      </div>

      <div className="content-area">
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

        {tab === "download" && <DownloadReports />}
      </div>
    </div>
  );
}
