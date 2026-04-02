import React, { useState } from "react";

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [expirationDate, setExpirationDate] = useState("");

  const handleCreate = async () => {
    const token = localStorage.getItem("invq_token");

    const res = await fetch("http://localhost:4000/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        itemName: name,
        quantity: Number(quantity),
        expirationDate: expirationDate || null
      })
    });

    if (res.ok) {
      alert("Product created");
      setName("");
      setQuantity(0);
      setExpirationDate("");
    } else {
      const err = await res.json();
      alert(err.message || "Failed to create product");
    }
  };

  return (
    <div>
      <h2>Create Product</h2>

      {/* Product Name */}
      <input
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Quantity */}
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      {/* Expiration Date (NEW) */}
      <input
        type="date"
        value={expirationDate}
        onChange={(e) => setExpirationDate(e.target.value)}
      />

      <button onClick={handleCreate}>
        Create
      </button>
    </div>
  );
}