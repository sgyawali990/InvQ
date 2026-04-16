import React, { useEffect, useState } from "react";
import { AlertTriangle, PackageOpen, Package, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BRAND_DARK = "#083344";
const RED_ALERT = "#EF4444";
const ORANGE_WARN = "#F97316";

export default function Alerts() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem("invq_token");

  const fetchInventory = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setInventory(data);
    } catch (err) {
      console.error("Alerts Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const alerts = inventory.filter(item => {
    const q = Number(item.quantity || 0);
    const t = Number(item.reorderThreshold || 0);
    return q <= t;
  });

  if (loading) return <div style={{ padding: '40px', color: BRAND_DARK }}>Scanning stock levels...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ 
        marginBottom: "32px", 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '15px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: BRAND_DARK, padding: '12px', borderRadius: '12px' }}>
            <PackageOpen color="white" size={28} />
          </div>
          <div>
            <h1 style={{ color: BRAND_DARK, fontSize: "32px", fontWeight: "800", margin: 0 }}>
              Attention Required
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              {alerts.length} items need restocking
            </p>
          </div>
        </div>

        <button
          onClick={fetchInventory}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            background: "white",
            color: BRAND_DARK,
            cursor: refreshing ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            transition: "all 0.2s"
          }}
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Updating..." : "Refresh"}
        </button>
      </header>

      {alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", backgroundColor: "white", borderRadius: "24px", border: "2px dashed #E2E8F0" }}>
          <Package size={48} color="#CBD5E1" style={{ marginBottom: '15px' }} />
          <p style={{ color: "#64748b", fontSize: "18px", fontWeight: '500' }}>All stock levels are currently healthy!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {alerts.map((item) => {
            const isOutOfStock = Number(item.quantity) === 0;
            
            return (
              <div key={item._id} 
                style={{
                  backgroundColor: "white",
                  borderRadius: "24px",
                  padding: "24px",
                  boxShadow: "0 10px 15px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #F1F5F9",
                  borderTop: `6px solid ${isOutOfStock ? RED_ALERT : ORANGE_WARN}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: "all 0.3s ease" // Smooth transition for the lift
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 20px 30px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 15px rgba(0,0,0,0.04)";
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      backgroundColor: isOutOfStock ? "#FEE2E2" : "#FFEDD5",
                      color: isOutOfStock ? RED_ALERT : ORANGE_WARN,
                    }}>
                      {isOutOfStock ? "OUT OF STOCK" : "LOW STOCK"}
                    </span>
                    <AlertTriangle size={20} color={isOutOfStock ? RED_ALERT : ORANGE_WARN} />
                  </div>

                  <h3 style={{ margin: "0 0 4px 0", color: BRAND_DARK, fontSize: '20px', fontWeight: '700' }}>{item.itemName}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>SKU: {item._id.slice(-8).toUpperCase()}</p>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '700' }}>CURRENT</p>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: isOutOfStock ? RED_ALERT : BRAND_DARK }}>
                      {item.quantity}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '700' }}>THRESHOLD</p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#475569' }}>{item.reorderThreshold}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    onClick={() => window.location.href = navigate("/inventory")}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #083344, #065f46)",
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.25s ease"
                    }}
                  >
                    Restock
                  </button>

                  <button
                    onClick={() => {
                      const query = encodeURIComponent(`${item.itemName} bulk discount`);
                      window.open(`https://www.google.com/search?tbm=shop&q=${query}`, "_blank");
                    }}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "12px",
                      border: "2px solid #E2E8F0",
                      backgroundColor: "white",
                      color: BRAND_DARK,
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F1F5F9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    Reorder
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}