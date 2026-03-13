import { useState } from "react";

export default function Settings(){

  const [password,setPassword] = useState("");

  const handleReset = async ()=>{

    const token = localStorage.getItem("invq_token");

    await fetch("/api/reset-password",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({password})
    });

    alert("Password updated");
    setPassword("");
  };

  return(
    <div className="settings-page">

      <h2>Account Settings</h2>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={handleReset}>
        Reset Password
      </button>

    </div>
  );
}