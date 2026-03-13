import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email,password})
    });

    const data = await res.json();

    if(data.token){
      localStorage.setItem("invq_token",data.token);
      navigate("/dashboard");
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="auth-page">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p onClick={()=>navigate("/register")}>Create Account</p>
    </div>
  );
}