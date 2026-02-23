import "./AddTeacher.css";
import { useState } from "react";
import axios from "axios";

export default function AddTeacher() {
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [subjects, setSubjects] = useState([
    { name: "", sem: "", faculty: "" }
  ]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, e) => {
    const updated = [...subjects];
    updated[index][e.target.name] = e.target.value;
    setSubjects(updated);
  };

  const addSubjectField = () =>
    setSubjects([...subjects, { name: "", sem: "", faculty: "" }]);

  const removeSubjectField = (index) =>
    setSubjects(subjects.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.email || !form.username || !form.password) {
      setMessage("Email, username, and password are required");
      return;
    }

    const formattedSubjects = subjects
      .filter(s => s.name && s.sem && s.faculty)
      .map(s => ({
        name: s.name.trim(),
        semester: Number(s.sem),
        faculty: s.faculty.trim()
      }));

    if (!formattedSubjects.length) {
      setMessage("At least one valid subject is required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:9001/api/admin/teacher",
        { ...form, subjects: formattedSubjects },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      setForm({ email: "", username: "", password: "" });
      setSubjects([{ name: "", sem: "", faculty: "" }]);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="add-teacher">
      <h2>Add Teacher</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleFormChange}
          required
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleFormChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleFormChange}
          required
        />

        <h3>Subjects</h3>

        {subjects.map((subj, index) => (
          <div key={index} className="subject-field">
            <input
              name="name"
              placeholder="Subject Name"
              value={subj.name}
              onChange={(e) => handleSubjectChange(index, e)}
              required
            />

            <select
              name="sem"
              value={subj.sem}
              onChange={(e) => handleSubjectChange(index, e)}
              required
            >
              <option value="">Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n} Semester</option>
              ))}
            </select>

            <select
              name="faculty"
              value={subj.faculty}
              onChange={(e) => handleSubjectChange(index, e)}
              required
            >
              <option value="">Select Program</option>  
              <option value="BCA">BCA</option>
              <option value="BSc CSIT">BSc CSIT</option>
              <option value="BIM">BIM</option>
              <option value="BBA">BBA</option>
              
            </select>

            {subjects.length > 1 && (
              <button
                type="button"
                onClick={() => removeSubjectField(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addSubjectField}>
          Add Another Subject
        </button>

        <button type="submit">Add Teacher</button>
      </form>
    </div>
  );
}