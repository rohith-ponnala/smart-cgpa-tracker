import { useState } from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { toast } from "react-toastify";

import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const registerUser = async () => {

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/register",
        formData
      );

      localStorage.setItem(
  "user",
  JSON.stringify(res.data)
);

      toast.success(
        "Registration successful 🎉"
      );

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>

        <h1>Register</h1>

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          style={input}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          style={input}
        />

        <button
          onClick={registerUser}
          disabled={loading}
          style={button}
        >
          {
            loading
              ? "Registering..."
              : "Register"
          }
        </button>

        <p>
          Already have account?
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#0b1120",
};

const card = {
  backgroundColor: "#1e293b",
  padding: "40px",
  borderRadius: "12px",
  width: "400px",
  color: "white",
};

const input = {
  width: "100%",
  padding: "14px",
  marginTop: "15px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
};

const button = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#00ff88",
  color: "black",
  fontWeight: "bold",
  cursor: "pointer",
};

export default Register;