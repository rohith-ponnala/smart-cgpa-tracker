import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import API from "../services/api";

function Login() {

  const navigate = useNavigate();
  useEffect(() => {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (user?.token) {
    navigate("/dashboard");
  }

}, []);

  const [formData, setFormData] =
    useState({
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

  const loginUser = async () => {

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      toast.success(
        "Login successful"
      );

      navigate("/dashboard");

    } catch (error) {

  console.log(error);

  toast.error(
    error.response?.data?.message ||
    "Something went wrong"
  );

}finally {

      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>

        <h1>Login</h1>

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
          onClick={loginUser}
          disabled={loading}
          style={button}
        >
          {
            loading
              ? "Logging in..."
              : "Login"
          }
        </button>

        <p>
          New user?
          <Link to="/register">
            Register
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

export default Login;