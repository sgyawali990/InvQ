import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertsPanel from "../components/Alerts/AlertsPanel";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUp,
  Download
} from "lucide-react";

const TEXT_DARK = "#0C1D26";
const BRAND_ICON = "#34C759";

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const username = localStorage.getItem("invq_user_name") || "User";
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
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  /* ------------------ 🔥 LOGIC: VALID ITEMS & EXPORT ------------------ */
  const validItems = inventory.filter(
    item => item.itemName && item.itemName.trim() !== ""
  );

  const lowStockItems = validItems.filter(
    item => Number(item.quantity || 0) <= Number(item.reorderThreshold || 0)
  );

  const totalItems = validItems.length;

  const inventoryHealth =
    totalItems === 0
      ? "—"
      : `${Math.round(((totalItems - lowStockItems.length) / totalItems) * 100)}%`;

  const exportCSV = () => {
    const headers = "Item Name,Quantity,Threshold\n";
    const rows = validItems
      .map(item => `${item.itemName},${item.quantity},${item.reorderThreshold}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard_inventory.csv";
    a.click();
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading Dashboard...</div>;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        backgroundImage:
          "radial-gradient(at 0% 0%, hsla(187, 92%, 92%, 1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(199, 89%, 88%, 1) 0px, transparent 50%)",
        overflowX: "hidden",
        fontFamily: '"Inter", sans-serif'
      }}
    >
      {/* TOP NAV: Title updated to "Dashboard" */}
      <div style={topNavStyle}>
        <h2 style={navTitleStyle}>Dashboard</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Note: In topNav, buttons now share this space */}
        </div>
      </div>

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* HEADER: Manage button removed - only Export remains */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Welcome, {username}.</h1>
            <p style={subtitleStyle}>Reports & Analytics Overview</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {/* Manage Inventory Button was here — DELETED */}
            <button
              style={refButtonStyle}
              onClick={exportCSV}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              Export Data <Download size={16} />
            </button>
          </div>
        </div>

        {/* SUMMARY CUBES */}
        <div style={cubeGrid}>
          <div style={cubeStyle}>
            <div style={{ ...iconContainerStyle, background: "#ECFBF0" }}>
              <Package size={22} color={BRAND_ICON} />
            </div>
            <div>
              <p style={cubeLabelStyle}>Total Items</p>
              <h2 style={cubeValueStyle}>{totalItems}</h2>
            </div>
            <ArrowUp size={20} color={BRAND_ICON} style={{ marginLeft: "auto" }} />
          </div>

          <div style={{ ...cubeStyle, cursor: "pointer" }} onClick={() => navigate("/inventory")}>
            <div style={{ ...iconContainerStyle, background: "#FFF0F0" }}>
              <AlertTriangle size={22} color="#EF4444" />
            </div>
            <div>
              <p style={cubeLabelStyle}>Low Stock</p>
              <h2 style={{ ...cubeValueStyle, color: "#EF4444" }}>
                {lowStockItems.length}
              </h2>
            </div>
          </div>

          <div style={cubeStyle}>
            <div style={{ ...iconContainerStyle, background: "#E8FAFC" }}>
              <TrendingUp size={22} color="#22D3EE" />
            </div>
            <div>
              <p style={cubeLabelStyle}>Inventory Health</p>
              <h2 style={cubeValueStyle}>{inventoryHealth}</h2>
            </div>
          </div>
        </div>

        {/* INVENTORY OVERVIEW: CLEAN HEADER + HOVER BUTTON + VERTICAL BARS */}
        <div style={graphContainerStyle}>

          {/* HEADER ROW (TITLE + BUTTON) */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px"
          }}>
            <h3 style={sectionTitle}>Inventory Overview</h3>

            <button
              onClick={() => navigate("/inventory")}
              style={manageButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(34, 197, 94, 0.4)";
                e.currentTarget.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.2)";
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              Manage Inventory
            </button>
          </div>

          {validItems.length === 0 ? (
            <p style={{ color: "#64748b" }}>No data to display.</p>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "24px",
              height: "240px",
              padding: "10px 0",
              borderBottom: "1px solid #E2E8F0"
            }}>
              {validItems.map((item, i) => {
                const qty = Number(item.quantity || 0);
                const threshold = Number(item.reorderThreshold || 0);
                const maxQty = Math.max(...validItems.map(i => Number(i.quantity || 1)));

                // Fixed pixel resolution for visual stability
                const barHeight = (qty / maxQty) * 180;

                let color = "#22C55E";
                let glow = "rgba(34,197,94,0.3)";

                if (qty === 0) {
                  color = "#EF4444";
                  glow = "rgba(239,68,68,0.3)";
                } else if (qty <= threshold) {
                  color = "#F97316";
                  glow = "rgba(249,115,22,0.3)";
                }

                return (
                  <div key={i} style={{
                    flex: 1,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end"
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: "800", color, marginBottom: "6px" }}>
                      {qty}
                    </div>
                    <div style={{
                      height: `${Math.max(barHeight, 6)}px`,
                      background: color,
                      borderRadius: "8px 8px 0 0",
                      boxShadow: `0 4px 12px ${glow}`,
                      transition: "all 0.3s ease"
                    }} />
                    <div style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: TEXT_DARK,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {item.itemName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONDITIONAL ALERTS */}
        {lowStockItems.length > 0 && (
          <div style={alertsContainer}>
            <div style={alertsHeader}>
              <h3 style={alertsTitle}>Critical Alerts</h3>
              <span style={alertBadge}>Action Required</span>
            </div>
            <AlertsPanel inventory={validItems} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------ STYLES ------------------ */

const topNavStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 40px",
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff"
};

const navTitleStyle = {
  fontWeight: "900",
  fontSize: "20px",
  color: TEXT_DARK,
  letterSpacing: "-0.02em"
};

const manageButtonStyle = {
  background: "linear-gradient(135deg, #22C55E, #06B6D4)",
  border: "none",
  color: "white",
  padding: "10px 22px",
  borderRadius: "12px",
  fontWeight: "800",
  cursor: "pointer",
  transition: "transform 0.2s ease",
  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px"
};

const titleStyle = {
  fontSize: "36px",
  fontWeight: "900",
  color: TEXT_DARK,
  letterSpacing: "-0.03em"
};

const subtitleStyle = {
  color: "#64748b",
  fontSize: "16px",
  fontWeight: "500"
};

const refButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  padding: "10px 18px",
  borderRadius: "12px",
  fontWeight: "700",
  color: TEXT_DARK,
  cursor: "pointer",
  transition: "background-color 0.2s ease"
};

const cubeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "24px",
  marginBottom: "30px"
};

const cubeStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  background: "#fff",
  padding: "24px",
  borderRadius: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
  transition: "transform 0.2s ease"
};

const cubeLabelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const cubeValueStyle = {
  fontSize: "28px",
  fontWeight: "900",
  color: TEXT_DARK,
  lineHeight: "1"
};

const iconContainerStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const graphContainerStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
  marginBottom: "30px"
};

const sectionTitle = {
  fontSize: "20px",
  fontWeight: "900",
  marginBottom: "24px",
  color: TEXT_DARK
};

const alertsContainer = {
  background: "#fff",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.03)"
};

const alertsHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
};

const alertsTitle = {
  fontWeight: "900",
  fontSize: "20px",
  color: TEXT_DARK
};

const alertBadge = {
  background: "#FEE2E2",
  color: "#EF4444",
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "800"
};