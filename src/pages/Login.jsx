
import React, {
  useContext,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { user, login, logout } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        alert("Login successful! 🎉");

        const from = location.state?.from || "/products";

        navigate(from, { replace: true });
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-card">

          <h1>Welcome 👋</h1>

          <p className="auth-subtitle">
            You are logged in as:
          </p>

          <p className="logged-user">
            {user.email}
          </p>

          <button
            className="auth-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Welcome Back!</h1>

        <p className="auth-subtitle">
          Login to continue shopping with ShopEasy.
        </p>

        {error && (
          <p className="error-message">{error}</p>
        )}

        <form onSubmit={handleSubmit}>

          <div className="auth-input-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")}>
            Register
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;
