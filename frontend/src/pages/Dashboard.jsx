import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertsPanel from "../components/Alerts/AlertsPanel";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUp,
  Search,
  Download,
  Bell
} from "lucide-react";

const TEXT_DARK = "#0C1D26"; 
const BRAND_ICON = "#34C759"; 
const GRAPH_LT_GRAY = "#D9D9D9"; 
const GRAPH_DK_GRAY = "#848484"; 

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Dynamically pulls the name of the person logged in
  const userName = localStorage.getItem("invq_user_name") || "User";
  const token = localStorage.getItem("invq_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/inventory", {
          headers: { Authorization: `Bearer ${token}` },
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

  const lowStockItems = Array.isArray(inventory) ? inventory.filter(item => 
    Number(item.quantity || 0) <= Number(item.reorderThreshold || 0)
  ) : [];

  if (loading) return <div style={{ padding: '40px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ 
      backgroundColor: "#F8FAFC",
      // Gradient background restored
      backgroundImage: `radial-gradient(at 0% 0%, hsla(187, 92%, 92%, 1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(199, 89%, 88%, 1) 0px, transparent 50%)`,
      minHeight: "100vh", 
      fontFamily: '"Inter", sans-serif' 
    }}>
      
      {/* 1. TOP NAVIGATION BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 40px", backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <h2 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: TEXT_DARK }}>InvQ Management Console</h2>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ border: '1px solid #DEDEDE', padding: '6px 12px', borderRadius: '8px', background: 'white' }}>
            <Search size={16} color="#A3A3A3" />
          </div>
          <Bell size={18} color="#64748b" />
        </div>
      </div>

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* 2. WELCOME HEADER (Dynamic User Name) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ margin: 0, color: TEXT_DARK, fontSize: "32px", fontWeight: "900", letterSpacing: "-0.02em" }}>
              Welcome, {userName}.
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#64748b", fontWeight: "500" }}>Reports & Analytics Overview</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={refButtonStyle} onClick={() => alert("CSV Exporting...")}>
              Export Data <Download size={16} />
            </button>
          </div>
        </div>

        {/* 3. THE SUMMARY CUBES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "30px" }}>
          <div style={cubeStyle}>
            <div style={{ ...iconContainerStyle, background: "#ECFBF0" }}>
              <Package size={22} color={BRAND_ICON} />
            </div>
            <div>
              <p style={cubeLabelStyle}>Total Items</p>
              <h2 style={cubeValueStyle}>{inventory.length}</h2>
            </div>
            <ArrowUp size={20} color={BRAND_ICON} style={{ marginLeft: 'auto' }} />
          </div>

          <div style={cubeStyle}>
            <div style={{ ...iconContainerStyle, background: "#FFF0F0" }}>
              <AlertTriangle size={22} color="#EF4444" />
            </div>
            <div>
              <p style={cubeLabelStyle}>Low Stock</p>
              <h2 style={{ ...cubeValueStyle, color: "#EF4444" }}>{lowStockItems.length}</h2>
            </div>
          </div>

          <div style={cubeStyle}>
            <div style={{ ...iconContainerStyle, background: "#E8FAFC" }}>
              <TrendingUp size={22} color="#22D3EE" />
            </div>
            <div>
              <p style={cubeLabelStyle}>Market Trend</p>
              <h2 style={cubeValueStyle}>+12.5%</h2>
            </div>
            <ArrowUp size={20} color={BRAND_ICON} style={{ marginLeft: 'auto' }} />
          </div>
        </div>

        {/* 4. THE GRAPH SECTION (Visual match to your image) */}
        <div style={graphContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: TEXT_DARK, fontWeight: '800' }}>Inventory Trends</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>● Light: Stock In</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>● Dark: Stock Out</span>
            </div>
          </div>
          
          <div style={{ height: "200px", borderLeft: "2px solid #E2E8F0", borderBottom: "2px solid #E2E8F0", paddingLeft: "20px", display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
            {[
              { LT: 60, DK: 75 },
              { LT: 85, DK: 95 },
              { LT: 45, DK: 60 },
              { LT: 90, DK: 80 },
              { LT: 55, DK: 70 },
              { LT: 75, DK: 85 }
            ].map((pair, i) => (
              <div key={i} style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '100%', width: '12%' }}>
                <div style={{ width: '100%', height: `${pair.LT}%`, backgroundColor: GRAPH_LT_GRAY, borderRadius: '4px 4px 0 0' }} />
                <div style={{ width: '100%', height: `${pair.DK}%`, backgroundColor: GRAPH_DK_GRAY, borderRadius: '4px 4px 0 0' }} />
              </div>
            ))}
          </div>
        </div>

        {/* 5. FOCUSED ALERTS PANEL (Remaining content) */}
        <div style={{ backgroundColor: "white", padding: "35px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: TEXT_DARK, fontSize: '20px', fontWeight: '800' }}>Critical Alerts</h3>
            <span style={{ background: '#FEE2E2', color: '#EF4444', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                Action Required
            </span>
          </div>
          <AlertsPanel inventory={inventory} />
        </div>
        
      </div>
    </div>
  );
}

// Styling Constants
const cubeStyle = { backgroundColor: "white", padding: "24px", borderRadius: "20px", display: 'flex', alignItems: 'center', gap: '15px', boxShadow: "0 10px 20px rgba(0,0,0,0.03)", border: "1px solid white" };
const iconContainerStyle = { padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cubeLabelStyle = { margin: 0, fontSize: "12px", color: "#64748b", fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' };
const cubeValueStyle = { margin: "2px 0 0 0", fontSize: "26px", fontWeight: "900", color: TEXT_DARK };
const graphContainerStyle = { backgroundColor: "white", padding: "35px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "30px", border: "1px solid white" };
const refButtonStyle = { background: 'white', border: '1px solid #E2E8F0', color: TEXT_DARK, padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
