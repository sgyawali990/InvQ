import { useState } from "react";

export default function CreateProduct(){

  const [name,setName] = useState("");
  const [quantity,setQuantity] = useState(0);

  const handleCreate = async ()=>{

    const token = localStorage.getItem("invq_token");

    await fetch("/api/inventory",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body: JSON.stringify({name,quantity})
    });

    alert("Product created");
    setName("");
    setQuantity(0);
  };

  return(
    <div>
      <h2>Create Product</h2>

      <input
        placeholder="Product Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e)=>setQuantity(e.target.value)}
      />

      <button onClick={handleCreate}>
        Create
      </button>

    </div>
  );
}