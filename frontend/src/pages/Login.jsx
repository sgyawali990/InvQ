import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseError) {
        return alert("Server Error: The backend sent an invalid response.");
      }

      if (res.ok && data.token) {
        localStorage.setItem("invq_token", data.token);
        localStorage.setItem("invq_user_name", username);
        localStorage.setItem("invq_user_email", data.user?.email || "");

        navigate("/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Could not connect to the server. Is the backend running on port 4000?");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.2s ease"
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      background: `
        radial-gradient(circle at top left, #dbeafe, transparent 40%),
        radial-gradient(circle at bottom right, #cffafe, transparent 40%),
        #f8fafc
      `
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        backgroundColor: "white", 
        padding: "40px", 
        borderRadius: "16px", 
        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        textAlign: "center" 
      }}>
        {/* Brand Logo */}
        <div style={{ 
          backgroundColor: "#0a3d34", 
          width: "50px", 
          height: "50px", 
          borderRadius: "12px", 
          margin: "0 auto 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "20px",
          fontWeight: "bold"
        }}>
          InvQ
        </div>

        <h2 style={{ color: "#0a3d34", margin: "0 0 10px 0" }}>Welcome Back</h2>
        <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "0.9rem" }}>
          Log in to manage your inventory
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.border = "1px solid #22c55e";
              e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #cbd5e1";
              e.target.style.boxShadow = "none";
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.border = "1px solid #22c55e";
              e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #cbd5e1";
              e.target.style.boxShadow = "none";
            }}
            required
          />
          <button 
            type="submit" 
            style={{ 
              width: "100%", 
              padding: "12px", 
              background: "linear-gradient(135deg, #0a3d34, #065f46)",
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "20px",
              boxShadow: "0 6px 14px rgba(10,61,52,0.25)",
              transition: "all 0.25s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 22px rgba(10,61,52,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(10,61,52,0.25)";
            }}
          >
            Sign In
          </button>
        </form>

        <div style={{ fontSize: "0.85rem" }}>
          <p style={{ margin: "5px 0" }}>
            <span 
              onClick={() => navigate("/forgot-password")}
              style={{ color: "#0a3d34", cursor: "pointer", fontWeight: "600" }}
            >
              Forgot Password?
            </span>
          </p>
          <p style={{ color: "#64748b" }}>
            Don't have an account?{" "}
            <span 
              onClick={() => navigate("/register")}
              style={{ color: "#0a3d34", cursor: "pointer", fontWeight: "600" }}
            >
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}