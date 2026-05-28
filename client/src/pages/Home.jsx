import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      <nav className="navbar">
        <h2>Smart CGPA Tracker</h2>

        <div className="nav-buttons">
          <Link to="/login">
            <button className="login-btn">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="register-btn">
              Register
            </button>
          </Link>
        </div>
      </nav>

      <div className="hero">

        <div className="hero-left">
          <h1>
            Track Your Academic Performance Easily
          </h1>

          <p>
            Calculate SGPA, CGPA, monitor subject
            performance and generate reports instantly.
          </p>

          <Link to="/register">
            <button className="start-btn">
              Get Started
            </button>
          </Link>
        </div>

        <div className="hero-right">
          <div className="card">
            <h3>✔ SGPA Calculator</h3>
          </div>

          <div className="card">
            <h3>✔ CGPA Analytics</h3>
          </div>

          <div className="card">
            <h3>✔ PDF Reports</h3>
          </div>

          <div className="card">
            <h3>✔ Performance Tracking</h3>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Home;