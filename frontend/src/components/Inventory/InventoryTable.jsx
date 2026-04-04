import React, { useState } from "react";

export default function InventoryTable({ 
  inventory, 
  setInventory, 
  mode, 
  pendingChanges, 
  setPendingChanges 
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [localRows, setLocalRows] = useState([]);
  const token = localStorage.getItem("invq_token");

  const allRows = [...inventory, ...localRows];

  const isRowEmpty = (item) => {
    return !item.itemName && item.quantity === 0 && item.reorderThreshold === 0;
  };

  const suggestionPool = [
    ...inventory.map(i => i.itemName),
    // Office
    "Printer Paper", "Ink Cartridges", "Stapler", "Paper Clips", "Envelopes",
    // Tech
    "USB-C Cable", "Monitor Stand", "Wireless Mouse", "Keyboard", "Webcam",
    // Cleaning
    "Disinfecting Wipes", "Paper Towels", "Trash Bags", "Glass Cleaner",
    // Food / Breakroom
    "Coffee Pods", "Sugar Packets", "Tea Bags", "Plastic Cups"
  ];

  const getSuggestion = (value) => {
    if (!value) return "";
    return suggestionPool.find(item => 
      item && 
      item.toLowerCase().startsWith(value.toLowerCase()) && 
      item.toLowerCase() !== value.toLowerCase()
    ) || "";
  };

  const startEditing = (itemId, field, value) => {
    setEditingCell({ id: itemId, field });
    setEditValue(value);
  };

  const handleKeyDown = (e, itemId) => {
    if (e.key === "Enter") saveEdit(itemId);
    if (e.key === "Tab") {
      e.preventDefault();
      saveEdit(itemId);
    }
  };

  const handleReorderSearch = (itemName) => {
    if (!itemName) return;
    const query = encodeURIComponent(itemName + " supplier");
    window.open(`https://www.google.com/search?tbm=shop&q=${query}`, "_blank");
  };

  const saveEdit = async (itemId) => {
    if (!editingCell) return;

    const field = editingCell.field;
    const currentItem = allRows.find(i => i._id === itemId);
    if (!currentItem) return;

    const input = editValue.toString().trim();
    const baseValue = pendingChanges[itemId]?.[field] ?? currentItem[field];

    let newValue;

    if (field !== "itemName" && /^[+*/-]/.test(input)) {
      const operator = input.charAt(0);
      const operand = Number(input.substring(1));

      if (isNaN(operand)) {
        newValue = baseValue;
      } else {
        switch (operator) {
          case '+': newValue = baseValue + operand; break;
          case '-': newValue = baseValue - operand; break;
          case '*': newValue = baseValue * operand; break;
          case '/': newValue = operand !== 0 ? baseValue / operand : baseValue; break;
          default: newValue = baseValue;
        }
      }
    } else {
      newValue = field === "itemName" ? input : Number(input || 0);
    }

    if (field !== "itemName") {
      newValue = Math.max(0, Math.floor(newValue));
    }

    if (currentItem.isTemp) {
      setLocalRows(prev =>
        prev.map(row =>
          row._id === itemId ? { ...row, [field]: newValue } : row
        )
      );
      setEditingCell(null);
      return;
    }

    if (mode === "EOD") {
      const original = currentItem[field];
      setPendingChanges(prev => {
        const updated = { ...prev };
        if (newValue === original) {
          if (updated[itemId]) {
            delete updated[itemId][field];
            if (Object.keys(updated[itemId]).length === 0) delete updated[itemId];
          }
          return updated;
        }
        updated[itemId] = { ...updated[itemId], [field]: newValue };
        return updated;
      });
      setEditingCell(null);
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/inventory/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...currentItem, [field]: newValue })
      });
      const data = await res.json();
      if (res.ok) {
        setInventory(prev =>
          prev.map(item => (item._id === itemId ? data : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
    setEditingCell(null);
  };

  // EXPORT LOGIC
  const getExportData = () => {
    return allRows
      .filter(item => item.itemName) // remove empty rows
      .map(item => {
        const isLow = item.quantity <= item.reorderThreshold;
        return {
          name: item.itemName,
          quantity: item.quantity,
          threshold: item.reorderThreshold,
          status: isLow ? "LOW STOCK" : "OK"
        };
      });
  };

  const handleExportCSV = () => {
    const data = getExportData();
    const headers = ["Item Name", "Quantity", "Threshold", "Status"];
    const rows = data.map(item => [item.name, item.quantity, item.threshold, item.status]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().split("T")[0];
    link.download = `Inventory_Report_${date}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const inputStyle = { width: '100%', border: '1px solid #007bff', outline: 'none', padding: '5px' };

  return (
    <div className="table-container" style={{
      background: "#fff",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() =>
            setLocalRows(prev => [
              ...prev,
              { _id: "temp-" + Date.now(), itemName: "", quantity: 0, reorderThreshold: 0, isTemp: true }
            ])
          }
          style={{
            padding: "10px 16px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          + Add Row
        </button>

        <button 
          onClick={handleExportCSV}
          style={{ padding: "10px 16px", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer" }}
        >
          ⬇️ Export CSV
        </button>

        <button 
          onClick={handlePrint}
          style={{ padding: "10px 16px", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer" }}
        >
          🖨️ Print / PDF
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>Item</th>
            <th style={{ padding: "10px" }}>Qty</th>
            <th style={{ padding: "10px" }}>Threshold</th>
            <th style={{ padding: "10px" }}>Status</th>
            <th style={{ padding: "10px" }}>Reorder</th>
            <th style={{ padding: "10px" }}></th>
          </tr>
        </thead>

        <tbody>
          {allRows.map(item => {
            const isEmpty = isRowEmpty(item);
            const isLow = !isEmpty && item.quantity <= item.reorderThreshold;
            const hasPending = pendingChanges[item._id] && Object.keys(pendingChanges[item._id]).length > 0;

            return (
              <tr
                key={item._id}
                style={{
                  background: hasPending ? "#fffbeb" : isLow ? "#fff1f1" : isEmpty ? "#fafafa" : "white",
                  borderBottom: "1px solid #eee"
                }}
              >
                {/* NAME */}
                <td onClick={() => startEditing(item._id, "itemName", item.itemName)} style={{ padding: "10px", position: "relative" }}>
                  {editingCell?.id === item._id && editingCell?.field === "itemName" ? (
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <span style={{ position: "absolute", left: "6px", color: "#ccc", pointerEvents: "none", fontSize: "inherit", fontFamily: "inherit" }}>
                        {editValue && getSuggestion(editValue)}
                      </span>
                      <input
                        style={{ ...inputStyle, background: "transparent", position: "relative", zIndex: 1 }}
                        value={editValue}
                        autoFocus
                        onBlur={() => saveEdit(item._id)}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          const currentSuggestion = getSuggestion(editValue);
                          if (e.key === "Tab" && currentSuggestion) {
                            e.preventDefault();
                            setEditValue(currentSuggestion);
                          } else {
                            handleKeyDown(e, item._id);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <span style={{ color: isEmpty ? "#aaa" : "#111" }}>
                      {item.itemName || "New item..."}
                    </span>
                  )}
                </td>

                {/* QTY */}
                <td onClick={() => startEditing(item._id, "quantity", pendingChanges[item._id]?.quantity ?? item.quantity)} style={{ padding: "10px" }}>
                  {editingCell?.field === "quantity" && editingCell?.id === item._id ? (
                    <input
                      style={inputStyle}
                      value={editValue}
                      autoFocus
                      onBlur={() => saveEdit(item._id)}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, item._id)}
                    />
                  ) : (
                    mode === "EOD" && pendingChanges[item._id]?.quantity !== undefined ? (
                      <span style={{ color: "#f59e0b", fontWeight: "600" }}>
                        {item.quantity} → {pendingChanges[item._id].quantity}
                      </span>
                    ) : item.quantity
                  )}
                </td>

                {/* THRESHOLD */}
                <td onClick={() => startEditing(item._id, "reorderThreshold", pendingChanges[item._id]?.reorderThreshold ?? item.reorderThreshold)} style={{ padding: "10px" }}>
                  {editingCell?.field === "reorderThreshold" && editingCell?.id === item._id ? (
                    <input
                      style={inputStyle}
                      value={editValue}
                      autoFocus
                      onBlur={() => saveEdit(item._id)}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, item._id)}
                    />
                  ) : (
                    mode === "EOD" && pendingChanges[item._id]?.reorderThreshold !== undefined ? (
                      <span style={{ color: "#f59e0b", fontWeight: "600" }}>
                        {item.reorderThreshold} → {pendingChanges[item._id].reorderThreshold}
                      </span>
                    ) : item.reorderThreshold
                  )}
                </td>

                <td style={{ padding: "10px" }}>
                  {isEmpty ? <span style={{ color: "#aaa" }}>—</span> : isLow ? <span style={{ color: "#dc2626", fontWeight: "600" }}>LOW</span> : <span style={{ color: "#16a34a" }}>OK</span>}
                </td>

                <td style={{ padding: "10px" }}>
                  {!isEmpty && isLow && (
                    <button onClick={() => handleReorderSearch(item.itemName)} style={{ cursor: "pointer", border: "none", background: "none" }}>🔍</button>
                  )}
                </td>

                <td style={{ padding: "10px" }}>
                  <button 
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#dc2626" }}
                    onClick={() => {
                      if (item.isTemp) {
                        setLocalRows(prev => prev.filter(r => r._id !== item._id));
                      } else {
                        setInventory(prev => prev.filter(r => r._id !== item._id));
                      }
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}