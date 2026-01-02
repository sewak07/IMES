import "./AddTeacher.css";
import { useState } from "react";
import axios from "axios";

export default function AddTeacher() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [subjects, setSubjects] = useState([{ name: "", sem: "" }]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, e) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][e.target.name] = e.target.value;
    setSubjects(updatedSubjects);
  };

  const addSubjectField = () => setSubjects([...subjects, { name: "", sem: "" }]);
  const removeSubjectField = (index) => setSubjects(subjects.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.email || !form.username || !form.password) {
      setMessage("Email, username, and password are required");
      return;
    }

    const formattedSubjects = subjects
      .filter(s => s.name.trim())
      .map(s => ({ name: s.name.trim(), semester: Number(s.sem) || null }));

    try {
      const res = await axios.post(
        "http://localhost:9001/api/admin/teacher",
        { ...form, subjects: formattedSubjects },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setForm({ email: "", username: "", password: "" });
      setSubjects([{ name: "", sem: "" }]);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="add-teacher">
      <h2>Add Teacher</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleFormChange} required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleFormChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleFormChange} required />

        <br /><br />
        <h3>Subjects</h3>
        <br />
        {subjects.map((subj, index) => (
          <div key={index} className="subject-field">
            <input
              name="name"
              placeholder="Subject Name"
              value={subj.name}
              onChange={(e) => handleSubjectChange(index, e)}
              required
            />
            &nbsp;&nbsp;

            <select
              name="sem"
              value={subj.sem}
              onChange={(e) => handleSubjectChange(index, e)}
              required
            >
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

            {subjects.length > 1 && (
              <button type="button" onClick={() => removeSubjectField(index)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSubjectField}>Add Another Subject</button>
        <button type="submit">Add Teacher</button>
      </form>
    </div>
  );
}
