import "./AddStudent.css";
import { useState } from "react";
import axios from "axios";

export default function AddStudent() {
  const [form, setForm] = useState({ email: "", username: "", password: "", semester: "", faculty: "" });
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:9001/api/admin/student",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setForm({ email: "", username: "", password: "", semester: "", faculty: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="add-student">
      <h2>Add Student</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <select name="semester" value={form.semester} onChange={handleChange} required >
          <option value="">Select Semester</option>
          <option value="1">1st Semester</option>
          <option value="2">2nd Semester</option>
          <option value="3">3rd Semester</option>
          <option value="4">4th Semester</option>
          <option value="5">5th Semester</option>
          <option value="6">6th Semester</option>
          <option value="7">7th Semester</option>
          <option value="8">8th Semester</option>
        </select>
         <select name="faculty" value={form.faculty} onChange={handleChange} required >
          <option value="">Select Program</option>
          <option value="BCA">BCA</option>
          <option value="CSIT">CSIT</option>
          <option value="BIM">BIM</option>
          <option value="BBA">BBA</option>
          <option value="BSC">BSC</option>
        </select>
        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}
