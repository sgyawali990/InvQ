import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  LayoutDashboard,
  Search,
  Download,
  Printer,
  TrendingUp
} from "lucide-react";
import InventoryTable from "../components/Inventory/InventoryTable";

const BRAND_DARK = "#0C1D26";
const BRAND_ACTION = "#22D3EE";
const BRAND_ICON = "#34C759";

export default function CreateProduct() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [newRowSignal, setNewRowSignal] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("invq_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setInventory(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const committedValidItems = useMemo(
    () =>
      inventory.filter(
        (item) => !item.isNew && item.itemName && item.itemName.trim() !== ""
      ),
    [inventory]
  );

  const lowStockCount = useMemo(
    () =>
      committedValidItems.filter(
        (item) =>
          Number(item.quantity || 0) <= Number(item.reorderThreshold || 0)
      ).length,
    [committedValidItems]
  );

  const totalQuantity = useMemo(
    () =>
      committedValidItems.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      ),
    [committedValidItems]
  );

  const exportCSV = () => {
    const headers = "Item Name,Quantity,Threshold\n";
    const rows = committedValidItems
      .map(
        (item) => `${item.itemName},${item.quantity},${item.reorderThreshold}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_report.csv";
    a.click();
  };

  const addNewItemRow = () => {
    const tempId = `temp-${Date.now()}`;
    setInventory((prev) => [
      {
        _id: tempId,
        itemName: "",
        quantity: "",
        reorderThreshold: "",
        isNew: true
      },
      ...prev
    ]);
    setNewRowSignal(Date.now());
  };

  const primaryButtonStyle = {
    background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease"
  };

  const qtyButtonStyle = {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease"
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Syncing Inventory...</div>;
  }

  return (
    <div
      className="printable-area"
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        backgroundImage:
          "radial-gradient(at 0% 0%, hsla(187, 92%, 92%, 1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(199, 89%, 88%, 1) 0px, transparent 50%)",
        overflowX: "hidden"
      }}
    >
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "16px", display: "flex" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(0,0,0,0.15)";
            }}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "30px"
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: BRAND_DARK,
                fontSize: "32px",
                fontWeight: "900"
              }}
            >
              Inventory
            </h1>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#64748B",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Tip: Press <strong>Enter</strong> to save, <strong>Tab</strong> to
              move across cells, and use math like <strong>+10</strong> in Stock.
            </p>
          </div>

          <div className="no-print" style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                backgroundColor: "white",
                fontWeight: "700",
                color: BRAND_DARK,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <Printer size={16} /> Print
            </button>

            <button
              onClick={exportCSV}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: BRAND_ICON,
                color: "white",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 4px 14px rgba(52, 199, 89, 0.22)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(52, 199, 89, 0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(52, 199, 89, 0.22)";
              }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px", marginBottom: "30px" }}>
          {[
            {
              label: "Unique Items",
              value: committedValidItems.length,
              icon: <Package size={22} color={BRAND_ICON} />,
              bg: "#ECFBF0"
            },
            {
              label: "Low Stock",
              value: lowStockCount,
              icon: <AlertTriangle size={22} color="#EF4444" />,
              bg: "#FFF0F0"
            },
            {
              label: "Total Stock",
              value: totalQuantity,
              icon: <TrendingUp size={22} color="#22D3EE" />,
              bg: "#E8FAFC"
            }
          ].map((card, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "20px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                transition: "all 0.18s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  background: card.bg,
                  padding: "12px",
                  borderRadius: "14px"
                }}
              >
                {card.icon}
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  {card.label}
                </h3>
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "26px",
                    fontWeight: "900",
                    color: BRAND_DARK
                  }}
                >
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            marginBottom: "30px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px"
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "800",
                  color: BRAND_DARK
                }}
              >
                Stock Management
              </h3>
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <button
                onClick={addNewItemRow}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: BRAND_DARK,
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.18s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                + Add Item
              </button>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  background: "#F8FAFC",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  width: "320px"
                }}
              >
                <Search color="#94A3B8" size={20} />
                <input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "14px",
                    background: "transparent"
                  }}
                />
              </div>
            </div>
          </div>

          <InventoryTable
            inventory={inventory}
            setInventory={setInventory}
            token={token}
            searchTerm={searchTerm}
            brandDark={BRAND_DARK}
            brandAction={BRAND_ACTION}
            qtyButtonStyle={qtyButtonStyle}
            newRowSignal={newRowSignal}
          />
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-area {
            padding: 0 !important;
            background: white !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #E5E7EB !important;
            padding: 10px !important;
            font-size: 12px !important;
          }
          th {
            background: #F3F4F6 !important;
            text-transform: uppercase;
            font-weight: 700;
          }
        }
      `}</style>
    </div>
  );
}