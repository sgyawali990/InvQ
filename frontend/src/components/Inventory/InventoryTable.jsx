import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Minus, ExternalLink, Trash2 } from "lucide-react";

const COLUMNS = ["itemName", "quantity", "reorderThreshold"];

export default function InventoryTable({
  inventory,
  setInventory,
  token,
  searchTerm = "",
  brandDark = "#0C1D26",
  brandAction = "#22D3EE",
  qtyButtonStyle = {},
  newRowSignal = 0
}) {
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [editValue, setEditValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRefs = useRef({});

  const visibleRows = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return inventory;
    return inventory.filter((item) =>
      (item.itemName || "").toLowerCase().includes(needle)
    );
  }, [inventory, searchTerm]);

  useEffect(() => {
    if (!editingCell) return;
    const key = `${editingCell.id}-${editingCell.field}`;
    const input = inputRefs.current[key];
    if (input) {
      input.focus();
      if (typeof input.select === "function") {
        input.select();
      }
    }
  }, [editingCell]);

  useEffect(() => {
    if (!newRowSignal) return;
    const newestTemp = inventory.find((item) => item.isNew);
    if (newestTemp) {
      setEditingCell({ id: newestTemp._id, field: "itemName" });
      setEditValue(newestTemp.itemName || "");
    }
  }, [newRowSignal, inventory]);

  const isCommittedItem = (item) =>
    !item.isNew && item.itemName && item.itemName.trim() !== "";

  const normalizeNumericInput = (rawInput, currentValue) => {
    const input = String(rawInput ?? "").trim();

    if (input === "") return "";

    if (/^[+\-*/]/.test(input)) {
      const operator = input.charAt(0);
      const operand = Number(input.substring(1));
      const base = Number(currentValue || 0);

      if (!Number.isNaN(operand)) {
        switch (operator) {
          case "+":
            return Math.max(0, Math.floor(base + operand));
          case "-":
            return Math.max(0, Math.floor(base - operand));
          case "*":
            return Math.max(0, Math.floor(base * operand));
          case "/":
            return operand !== 0 ? Math.max(0, Math.floor(base / operand)) : base;
          default:
            return base;
        }
      }
      return base;
    }

    const parsed = Number(input);
    if (Number.isNaN(parsed)) return currentValue;
    return Math.max(0, Math.floor(parsed));
  };

  const getRowIndexById = (rowId) =>
    visibleRows.findIndex((row) => row._id === rowId);

  const getNavigationTarget = (rowId, field, action) => {
    const rowIndex = getRowIndexById(rowId);
    const colIndex = COLUMNS.indexOf(field);
    if (rowIndex === -1 || colIndex === -1) return null;

    if (action === "tab-next") {
      if (colIndex < COLUMNS.length - 1) {
        return { id: visibleRows[rowIndex]._id, field: COLUMNS[colIndex + 1] };
      }
      if (rowIndex < visibleRows.length - 1) {
        return { id: visibleRows[rowIndex + 1]._id, field: COLUMNS[0] };
      }
      return null;
    }

    if (action === "tab-prev") {
      if (colIndex > 0) {
        return { id: visibleRows[rowIndex]._id, field: COLUMNS[colIndex - 1] };
      }
      if (rowIndex > 0) {
        return {
          id: visibleRows[rowIndex - 1]._id,
          field: COLUMNS[COLUMNS.length - 1]
        };
      }
      return null;
    }

    if (action === "enter-next-row") {
      if (rowIndex < visibleRows.length - 1) {
        return { id: visibleRows[rowIndex + 1]._id, field };
      }
      return null;
    }

    if (action === "arrow-up") {
      if (rowIndex > 0) {
        return { id: visibleRows[rowIndex - 1]._id, field };
      }
      return null;
    }

    if (action === "arrow-down") {
      if (rowIndex < visibleRows.length - 1) {
        return { id: visibleRows[rowIndex + 1]._id, field };
      }
      return null;
    }

    return null;
  };

  const startEditing = (id, field, value) => {
    setEditingCell({ id, field });
    setEditValue(value ?? "");
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const replaceItemLocal = (id, updater) => {
    setInventory((prev) =>
      prev.map((item) => (item._id === id ? updater(item) : item))
    );
  };

  const createServerItemIfReady = async (draftItem) => {
    const hasName = draftItem.itemName && draftItem.itemName.trim() !== "";
    const hasQty = draftItem.quantity !== "" && draftItem.quantity !== null;
    const hasThreshold =
      draftItem.reorderThreshold !== "" && draftItem.reorderThreshold !== null;

    if (!hasName || !hasQty || !hasThreshold) return false;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName: draftItem.itemName.trim(),
          quantity: Number(draftItem.quantity),
          reorderThreshold: Number(draftItem.reorderThreshold)
        })
      });

      if (!res.ok) {
        console.error("Create failed");
        return false;
      }

      const created = await res.json();
      setInventory((prev) =>
        prev.map((item) => (item._id === draftItem._id ? created : item))
      );
      return true;
    } catch (err) {
      console.error("Create error:", err);
      return false;
    }
  };

  const saveEdit = async (itemId, field, navigationAction = null) => {
    const item = inventory.find((i) => i._id === itemId);
    if (!item) return;

    const rawInput = editValue;
    let nextValue;

    if (field === "itemName") {
      nextValue = String(rawInput ?? "").trim();
    } else {
      nextValue = normalizeNumericInput(rawInput, item[field]);
    }

    if (item.isNew && field === "itemName" && nextValue === "") {
      setInventory((prev) => prev.filter((i) => i._id !== itemId));
      cancelEditing();
      return;
    }

    const previousItem = { ...item };
    const draftedItem = {
      ...item,
      [field]: nextValue
    };

    replaceItemLocal(itemId, () => draftedItem);

    if (item.isNew) {
      await createServerItemIfReady(draftedItem);
    } else {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/inventory/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ [field]: nextValue })
        });

        if (res.ok) {
          const updated = await res.json();
          replaceItemLocal(itemId, () => updated);
        } else {
          replaceItemLocal(itemId, () => previousItem);
        }
      } catch (err) {
        console.error("Update error:", err);
        replaceItemLocal(itemId, () => previousItem);
      }
    }

    const target = navigationAction
      ? getNavigationTarget(itemId, field, navigationAction)
      : null;

    cancelEditing();

    if (target) {
      const targetItem = inventory.find((i) => i._id === target.id);
      const targetValue = targetItem ? targetItem[target.field] : "";
      setTimeout(() => {
        setEditingCell(target);
        setEditValue(targetValue ?? "");
      }, 0);
    }
  };

  const getSuggestions = (value) => {
    if (!value.trim()) return [];
    // Extract matches and use a Set to deduplicate identical names
    const rawSuggestions = inventory
      .map((i) => i.itemName)
      .filter((name) => name?.toLowerCase().includes(value.toLowerCase()));
    return [...new Set(rawSuggestions)].slice(0, 5);
  };

  const handleCellKeyDown = async (e, itemId, field) => {
    if (e.key === "Tab") {
      e.preventDefault();
      // 🔥 IF suggestions exist → accept suggestion instead of tabbing
      if (field === "itemName" && suggestions.length > 0 && activeSuggestionIndex >= 0) {
        setEditValue(suggestions[activeSuggestionIndex]);
        setSuggestions([]);
        return;
      }
      // otherwise → normal tab behavior
      await saveEdit(itemId, field, e.shiftKey ? "tab-prev" : "tab-next");
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      // Support accepting suggestion on Enter as well
      if (field === "itemName" && suggestions.length > 0 && activeSuggestionIndex >= 0) {
        setEditValue(suggestions[activeSuggestionIndex]);
        setSuggestions([]);
        return;
      }
      await saveEdit(itemId, field, "enter-next-row");
      return;
    }

    if (e.key === "ArrowUp") {
      if (field === "itemName" && suggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      e.preventDefault();
      await saveEdit(itemId, field, "arrow-up");
      return;
    }

    if (e.key === "ArrowDown") {
      if (field === "itemName" && suggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          (prev + 1) % suggestions.length
        );
        return;
      }
      e.preventDefault();
      await saveEdit(itemId, field, "arrow-down");
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  const updateQty = async (item, change) => {
    const currentQty = Number(item.quantity || 0);
    const newQty = Math.max(0, currentQty + change);

    if (item.isNew) {
      replaceItemLocal(item._id, (prev) => ({ ...prev, quantity: newQty }));
      const drafted = {
        ...item,
        quantity: newQty
      };
      await createServerItemIfReady(drafted);
      return;
    }

    const previous = { ...item };
    replaceItemLocal(item._id, (prev) => ({ ...prev, quantity: newQty }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/inventory/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQty })
      });

      if (res.ok) {
        const updated = await res.json();
        replaceItemLocal(item._id, () => updated);
      } else {
        replaceItemLocal(item._id, () => previous);
      }
    } catch (err) {
      console.error("Qty update error:", err);
      replaceItemLocal(item._id, () => previous);
    }
  };

  const handleDelete = async (item) => {
    // Ask for confirmation (The "Poor Man's Undo")
    const confirmMsg = item.isNew
      ? "Discard this new row?"
      : `Are you sure you want to delete "${item.itemName || 'this item'}"?`;

    if (!window.confirm(confirmMsg)) return;

    // Handle temporary rows (Local only)
    if (item.isNew) {
      setInventory((prev) => prev.filter((i) => i._id !== item._id));
      return;
    }

    // Handle saved items (Server + Local)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/inventory/${item._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setInventory((prev) => prev.filter((i) => i._id !== item._id));
      } else {
        alert("Failed to delete item. Please try again.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error: Could not reach the server.");
    }
  };

  const handleReorderSearch = (itemName) => {
    if (!itemName) return;
    const query = encodeURIComponent(`${itemName} bulk discount`);
    window.open(`https://www.google.com/search?tbm=shop&q=${query}`, "_blank");
  };

  const getRowVisualState = (item) => {
    const isValid = isCommittedItem(item);
    const qty = Number(item.quantity || 0);
    const threshold = Number(item.reorderThreshold || 0);

    const isLow = isValid && qty <= threshold;
    const isWarning = isValid && qty > threshold && qty <= threshold * 1.5;

    if (item.isNew) {
      return {
        backgroundColor: "#F0F9FF",
        borderLeft: "4px solid #22D3EE"
      };
    }

    if (isLow) {
      return {
        backgroundColor: "#FEF2F2",
        borderLeft: "4px solid #EF4444"
      };
    }

    if (isWarning) {
      return {
        backgroundColor: "#FFFBEB",
        borderLeft: "4px solid #F59E0B"
      };
    }

    return {
      backgroundColor: "white",
      borderLeft: "4px solid transparent"
    };
  };

  const renderEditableCell = (item, field, cellStyle = {}, placeholder = "") => {
    const isEditing =
      editingCell?.id === item._id && editingCell?.field === field;

    const inputKey = `${item._id}-${field}`;

    if (isEditing) {
      return (
        <div style={{ position: "relative", width: field === "itemName" ? "100%" : "64px" }}>
          <input
            ref={(node) => {
              if (node) inputRefs.current[inputKey] = node;
            }}
            autoFocus
            value={editValue}
            onChange={(e) => {
              const val = e.target.value;
              setEditValue(val);
              
              if (field === "itemName") {
                const sugs = getSuggestions(val);
                // Hide suggestions if the typed value exactly matches the only suggestion
                if (sugs.length === 1 && sugs[0].toLowerCase() === val.trim().toLowerCase()) {
                  setSuggestions([]);
                } else {
                  setSuggestions(sugs);
                }
                setActiveSuggestionIndex(0);
              }
            }}
            onBlur={() => {
              saveEdit(item._id, field);
              setSuggestions([]);
            }}
            onKeyDown={(e) => handleCellKeyDown(e, item._id, field)}
            style={{
              width: "100%", // Controlled by parent div now
              minHeight: "36px",
              padding: field === "itemName" ? "8px 10px" : "6px 8px",
              borderRadius: "10px",
              border: `2px solid ${brandAction}`,
              outline: "none",
              background: "#ECFEFF",
              fontSize: "14px",
              fontWeight: "700",
              fontFamily: "inherit",
              color: brandDark,
              textAlign: field === "itemName" ? "left" : "center",
              boxShadow: "0 0 0 4px rgba(34,211,238,0.12)"
            }}
          />
          
          {field === "itemName" && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                background: "white",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                marginTop: "4px",
                zIndex: 10,
                width: "100%",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                overflow: "hidden"
              }}
            >
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 12px",
                    background: i === activeSuggestionIndex ? "#ECFEFF" : "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: brandDark
                  }}
                  onMouseDown={(e) => {
                    // preventDefault stops the input from blurring immediately, 
                    // allowing the click to register smoothly.
                    e.preventDefault(); 
                    setEditValue(s);
                    setSuggestions([]);
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const rawValue = item[field];
    const showPlaceholder =
      (field === "itemName" && !String(rawValue || "").trim()) ||
      ((field === "quantity" || field === "reorderThreshold") &&
        (rawValue === "" || rawValue === null || rawValue === undefined));

    return (
      <span
        onClick={() => startEditing(item._id, field, rawValue)}
        style={{
          cursor: "pointer",
          display: "inline-block",
          minWidth: field === "itemName" ? "160px" : "32px",
          ...cellStyle
        }}
        title={field === "quantity" ? "Supports math like +10, -3, *2, /2" : undefined}
      >
        {showPlaceholder ? (
          <span
            style={{
              color: field === "itemName" ? "#93C5FD" : "#CBD5E1",
              fontStyle: "italic",
              fontWeight: "600"
            }}
          >
            {placeholder}
          </span>
        ) : (
          rawValue
        )}
      </span>
    );
  };

  return (
    <div style={{ overflow: "hidden", border: "1px solid #F1F5F9", borderRadius: "18px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead
          style={{
            background: "#F8FAFC",
            color: "#64748B",
            fontSize: "12px",
            fontWeight: "800",
            borderBottom: "1px solid #E2E8F0"
          }}
        >
          <tr>
            <th style={headerCellStyle("left")}>ITEM</th>
            <th style={headerCellStyle("center")}>STOCK</th>
            <th style={headerCellStyle("center")}>ALERT</th>
            <th style={headerCellStyle("center")}>REORDER</th>
            <th style={headerCellStyle("center")}>DELETE</th>
          </tr>
        </thead>

        <tbody>
          {visibleRows.map((item) => {
            const rowVisual = getRowVisualState(item);
            const isValid = isCommittedItem(item);
            const qty = Number(item.quantity || 0);
            const threshold = Number(item.reorderThreshold || 0);
            const isLow = isValid && qty <= threshold;

            return (
              <tr
                key={item._id}
                style={{
                  borderBottom: "1px solid #F1F5F9",
                  transition: "background-color 0.2s ease",
                  ...rowVisual
                }}
                onMouseEnter={(e) => {
                  if (!item.isNew && !isLow && !(isValid && qty > threshold && qty <= threshold * 1.5)) {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = rowVisual.backgroundColor;
                }}
              >
                <td style={bodyCellStyle("left")}>
                  {renderEditableCell(
                    item,
                    "itemName",
                    {
                      color: brandDark,
                      fontSize: "15px",
                      fontWeight: "700"
                    },
                    "Click to name..."
                  )}
                </td>

                <td style={bodyCellStyle("center")}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px"
                    }}
                  >
                    <button
                      onClick={() => updateQty(item, -1)}
                      style={qtyButtonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F1F5F9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      <Minus size={14} />
                    </button>

                    {renderEditableCell(
                      item,
                      "quantity",
                      {
                        minWidth: "32px",
                        textAlign: "center",
                        color: isLow ? "#DC2626" : brandDark,
                        fontSize: "15px",
                        fontWeight: "800"
                      },
                      "—"
                    )}

                    <button
                      onClick={() => updateQty(item, 1)}
                      style={qtyButtonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F1F5F9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </td>

                <td style={bodyCellStyle("center")}>
                  {renderEditableCell(
                    item,
                    "reorderThreshold",
                    {
                      color: "#64748B",
                      fontWeight: "700",
                      fontSize: "15px"
                    },
                    "—"
                  )}
                </td>

                <td style={bodyCellStyle("center")}>
                  {isValid ? (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: brandAction,
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "10px",
                        transition: "all 0.15s ease"
                      }}
                      onClick={() => handleReorderSearch(item.itemName)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ECFEFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <ExternalLink size={18} />
                    </button>
                  ) : null}
                </td>

                <td style={bodyCellStyle("center")}>
                  <button
                    onClick={() => handleDelete(item)}
                    style={{
                      color: "#EF4444",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "10px",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#FEF2F2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Trash2 size={18} />
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

function headerCellStyle(textAlign = "left") {
  return {
    padding: "16px 24px",
    textAlign,
    letterSpacing: "0.05em"
  };
}

function bodyCellStyle(textAlign = "left") {
  return {
    padding: "16px 24px",
    textAlign
  };
}