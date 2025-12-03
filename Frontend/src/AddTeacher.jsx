import { useState } from "react";
import axios from "axios";

export default function AddTeacher() {
  const [form, setForm] = useState({ email: "", username: "", password: "", subjects: "" });
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
        "http://localhost:9001/api/admin/teacher",
        { ...form, subjects: form.subjects.split(",") },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setForm({ email: "", username: "", password: "", subjects: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="add-teacher">
      <h2>Add Teacher</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <input name="subjects" placeholder="Subjects (comma separated)" value={form.subjects} onChange={handleChange} />
        <button type="submit">Add Teacher</button>
      </form>
    </div>
  );
}
