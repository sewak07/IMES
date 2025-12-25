import "./AddStudent.css";
import { useState } from "react";
import axios from "axios";

export default function AddStudent() {
  const [form, setForm] = useState({ email: "", username: "", password: "", semester: "", faculty:"" });
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
      setForm({ email: "", username: "", password: "", semester: "", faculty:"" });
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
        <input name="semester" type="number" placeholder="Semester" value={form.semester} onChange={handleChange} />
        <input name="faculty" type="text" placeholder="Faculty" value={form.faculty} onChange={handleChange} />
        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}
