import { useState } from "react";

export default function CreateStore(){

  const [storeName,setStoreName] = useState("");

  const handleCreate = async ()=>{

    const token = localStorage.getItem("invq_token");

    await fetch("/api/store",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({storeName})
    });

    alert("Store created");
    setStoreName("");
  };

  return(
    <div>

      <h2>Create Store</h2>

      <input
        placeholder="Store Name"
        value={storeName}
        onChange={(e)=>setStoreName(e.target.value)}
      />

      <button onClick={handleCreate}>
        Create Store
      </button>

    </div>
  );
}