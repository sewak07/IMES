import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import TeacherDashboard from "./TeacherDashboard.jsx";
import AdminStudentPerformance from "./AdminStudentPerformance.jsx"; // ← import the component

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/student/:id" element={<AdminStudentPerformance />} /> {/* ← new route */}
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
    </Routes>
  );
}

export default App;
