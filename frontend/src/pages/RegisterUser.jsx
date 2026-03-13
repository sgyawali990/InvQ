import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterUser(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e)=>{
    e.preventDefault();

    const res = await fetch("/api/register",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email,password})
    });

    if(res.ok){
      alert("Account created");
      navigate("/");
    } else {
      alert("Registration failed");
    }
  };

  return(
    <div className="auth-page">
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}