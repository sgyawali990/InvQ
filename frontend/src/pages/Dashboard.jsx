import React, { useEffect, useState } from "react";
import InventoryTable from "../components/Inventory/InventoryTable";
import AlertsPanel from "../components/Alerts/AlertsPanel";

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [mode, setMode] = useState("MANUAL");
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState({});
  const [reorderSuggestions, setReorderSuggestions] = useState([]);

  const totalItems = inventory.length;

const lowStockCount = inventory.filter(
  (item) => item.quantity <= item.reorderThreshold
).length;

const totalQuantity = inventory.reduce(
  (sum, item) => sum + item.quantity,
  0
);
  const token = localStorage.getItem("invq_token");

  const fetchData = async () => {
    try {
      const invRes = await fetch("http://localhost:4000/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const invData = await invRes.json();
      if (Array.isArray(invData)) setInventory([...invData]);

      const storeRes = await fetch("http://localhost:4000/store", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const storeData = await storeRes.json();
      if (storeData?.updateMode) setMode(storeData.updateMode);

      const reorderRes = await fetch("http://localhost:4000/inventory/reorder-suggestions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reorderData = await reorderRes.json();
      if (Array.isArray(reorderData)) setReorderSuggestions(reorderData);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = async () => {
    const newMode = mode === "MANUAL" ? "EOD" : "MANUAL";
    try {
      const res = await fetch("http://localhost:4000/store/update-mode", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updateMode: newMode }),
      });

      if (res.ok) {
        setMode(newMode);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to switch modes:", err);
    }
  };

  const applyEOD = async () => {
    if (!window.confirm("Sync all pending changes to live inventory?")) return;

    try {
      const res = await fetch("http://localhost:4000/inventory/apply-eod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pendingChanges }),
      });

      if (!res.ok) throw new Error("Sync failed");

      alert("Inventory Synced!");
      setPendingChanges({});

      setTimeout(() => {
        fetchData();
      }, 50);
    } catch (err) {
      console.error("EOD Apply Error:", err);
      alert("Error syncing: Check console.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="dashboard">Initializing InvQ...</div>;
return (
  <div className="dashboard">

    <div
      className="dashboard-header"
      style={{
        marginBottom: "20px",
        gridColumn: "1 / span 2",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h1>Store Dashboard</h1>

        <p style={{ margin: 0, color: "#64748b" }}>
          Manage your workspace items
        </p>

        <p style={{ margin: 0, fontWeight: "500" }}>
          Mode:
          <span
            style={{
              color: mode === "MANUAL" ? "#10b981" : "#f59e0b",
              marginLeft: "6px",
            }}
          >
            {mode === "MANUAL" ? "LIVE" : "EOD"}
          </span>
        </p>
      </div>
<<<<<<< HEAD

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button
          onClick={toggleMode}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            background: "white",
            cursor: "pointer",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: mode === "MANUAL" ? "#10b981" : "#f59e0b" }}>●</span>
          {mode === "MANUAL" ? "Switch to EOD Mode" : "Switch to Live Mode"}
        </button>

        <button
          onClick={applyEOD}
          disabled={mode === "MANUAL" || Object.keys(pendingChanges).length === 0}
          style={{
            background: mode === "MANUAL" ? "#94a3b8" : "#1e293b",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: mode === "MANUAL" ? "not-allowed" : "pointer",
            fontWeight: "600",
          }}
        >
          Sync All Changes
        </button>
=======
      
      <div className="inventory-section">
        <InventoryTable
          inventory={inventory}
          setInventory={setInventory}
          mode={mode}
          pendingChanges={pendingChanges}
          setPendingChanges={setPendingChanges}
        />
      </div>

      <div className="alerts-section">
        <AlertsPanel inventory={inventory} />
>>>>>>> 6d2b27616d007e0a0238a2918d06a21390bcb6f6
      </div>
    </div>

    <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
      <div className="card">
        <h3>Total Items</h3>
        <p>{totalItems}</p>
      </div>

      <div className="card">
        <h3>Low Stock</h3>
        <p style={{ color: "#ef4444" }}>{lowStockCount}</p>
      </div>

      <div className="card">
        <h3>Total Quantity</h3>
        <p>{totalQuantity}</p>
      </div>
    </div>

    {reorderSuggestions.length > 0 && (
      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          background: "#fff7ed",
          border: "1px solid #fdba74",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Reorder Suggestions</h3>

        {reorderSuggestions.map((item) => (
          <div key={item.itemId} style={{ marginBottom: "10px" }}>
            <strong>{item.itemName}</strong> — current stock: {item.quantity}, threshold:{" "}
            {item.reorderThreshold}, suggested reorder: {item.suggestedReorder}
          </div>
        ))}
      </div>
    )}

    <div className="inventory-section">
      <InventoryTable
        inventory={inventory}
        setInventory={setInventory}
        mode={mode}
        pendingChanges={pendingChanges}
        setPendingChanges={setPendingChanges}
      />
    </div>

    <div className="alerts-section">
      <AlertsPanel inventory={inventory} />
    </div>

  </div>
);
}