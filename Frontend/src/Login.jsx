import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value, 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:9001/api/auth/login",
        form
      );

      const { role, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "Admin") navigate("/admin");
      if (role === "Teacher") navigate("/teacher");
      if (role === "Student") navigate("/student");

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          autoComplete="username"
        />

        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
        />

        {error && <p className="error-msg">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
