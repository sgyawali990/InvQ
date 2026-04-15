import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Reset email sent successfully!");
        navigate("/");
      } else {
        alert(data.message || data.error || "Request completed");
      }
      setEmail("");
      
    } catch (err) {
      console.error("Forgot password error:", err);
      alert("Could not send reset email");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    boxSizing: "border-box"
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      backgroundColor: "#f1f5f9"
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        backgroundColor: "white", 
        padding: "40px", 
        borderRadius: "16px", 
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
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

        <h2 style={{ color: "#0a3d34", margin: "0 0 10px 0" }}>Recover Password</h2>
        <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "0.9rem" }}>
          Enter your email and we'll send you a link to reset your account.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <button 
            type="submit" 
            style={{ 
              width: "100%", 
              padding: "12px", 
              // Premium same gradient upgrade for button consistency
              background: "linear-gradient(135deg, #0a3d34, #065f46)",
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "20px"
            }}
          >
            Send Reset Email
          </button>
        </form>

        <div style={{ fontSize: "0.85rem" }}>
          <p 
            onClick={() => navigate("/")}
            style={{ color: "#0a3d34", cursor: "pointer", fontWeight: "600" }}
          >
            Return to Login
          </p>
        </div>
      </div>
    </div>
  );
}