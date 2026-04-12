import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, Plus, Minus, AlertCircle, RefreshCw, LayoutDashboard, 
  Search, Download, Printer, ExternalLink 
} from "lucide-react";
import AlertsPanel from "../components/Alerts/AlertsPanel";

const BRAND_DARK = "#083344"; 
const BRAND_ACTION = "#22D3EE";
const BRAND_MIST = "#CFFAFE";

export default function CreateProduct() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [threshold, setThreshold] = useState("");
  const [supplierUrl, setSupplierUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("invq_token");

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:4000/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setInventory(data);
    } catch (err) { console.error("Fetch Error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  //  UPDATE QUANTITY 
  const handleUpdateQty = async (id, currentQty, change) => {
    const newQty = Math.max(0, currentQty + change);
    try {
      await fetch(`http://localhost:4000/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: newQty }),
      });
      fetchData();
    } catch (err) { console.error("Update Error:", err); }
  };

  //  ADD NEW ITEM
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:4000/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            itemName: name,
            quantity: Number(qty), 
            reorderThreshold: Number(threshold),
            supplierUrl: supplierUrl
        }),
      });
      if (res.ok) {
        setName(""); setQty(""); setThreshold(""); setSupplierUrl("");
        fetchData();
      }
    } catch (err) { console.error("Submit Error:", err); }
    finally { setIsSubmitting(false); }
  };

  // EXPORT & PRINT 
  const exportCSV = () => {
    const headers = "Item Name,Quantity,Threshold\n";
    const rows = inventory.map(item => `${item.itemName},${item.quantity},${item.reorderThreshold}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_report.csv";
    a.click();
  };

  
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const filteredInventory = safeInventory.filter(item => 
    (item.itemName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const lowStockCount = safeInventory.filter(item => 
    Number(item.quantity || 0) <= Number(item.reorderThreshold || 0)
  ).length;

  const totalQuantity = safeInventory.reduce((sum, item) => 
    sum + (Number(item.quantity) || 0), 0
  );

  if (loading) return <div style={{ padding: '40px' }}>Syncing Inventory...</div>;

  return (
    <div className="printable-area" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", padding: "40px" }}>
      
      {/* 1. HEADER & BUTTONS */}
      <div style={{ marginBottom: "30px", display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <button onClick={() => navigate("/dashboard")} style={{ background: 'none', border: 'none', color: "#64748b", cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <h1 style={{ margin: 0, color: BRAND_DARK, fontSize: '32px', fontWeight: '800' }}>Inventory</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>
            <Printer size={18} /> Print
          </button>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: 'none', backgroundColor: BRAND_ACTION, color: BRAND_DARK, fontWeight: '700', cursor: 'pointer' }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Info CUBES  */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "40px" }}>
        {[
          { label: "Unique Items", value: safeInventory.length, icon: <Package size={22} color={BRAND_ACTION} /> },
          { label: "Low Stock", value: lowStockCount, icon: <AlertCircle size={22} color="#EF4444" /> },
          { label: "Total Stock", value: totalQuantity, icon: <RefreshCw size={22} color={BRAND_ACTION} /> }
        ].map((card, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: card.label === "Low Stock" ? "#FEE2E2" : BRAND_MIST, padding: '15px', borderRadius: '14px' }}>{card.icon}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>{card.label}</h3>
              <p style={{ margin: "5px 0 0 0", fontSize: "28px", fontWeight: "800", color: BRAND_DARK }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "30px" }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* 3. ADD NEW ITEM FORM */}
          <div className="no-print" style={{ backgroundColor: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginBottom: '20px', color: BRAND_DARK }}>Add New Stock</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '40px', marginBottom: '15px' }}>
              <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
              <input type="number" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
              <input type="number" placeholder="Alert" value={threshold} onChange={(e) => setThreshold(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="text" placeholder="Supplier Website URL" value={supplierUrl} onChange={(e) => setSupplierUrl(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
              <button onClick={handleSubmit} disabled={isSubmitting} style={{ backgroundColor: BRAND_DARK, color: 'white', padding: '0 25px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                {isSubmitting ? "Adding..." : "Add Item"}
              </button>
            </div>
          </div>

          {/* 4. MAIN INVENTORY TABLE */}
          <div style={{ backgroundColor: "white", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", overflow: 'hidden' }}>
            <div className="no-print" style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '12px' }}>
              <Search color="#94A3B8" />
              <input placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#F8FAFC', color: '#64748B', fontSize: '11px' }}>
                <tr>
                  <th style={{ padding: '18px 24px', textAlign: 'left' }}>ITEM</th>
                  <th style={{ textAlign: 'center' }}>STOCK LEVEL</th>
                  <th style={{ textAlign: 'center' }}>ALERT</th>
                  <th style={{ textAlign: 'center' }}>SUPPLIER</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const isLow = Number(item.quantity) <= Number(item.reorderThreshold);
                  return (
                    <tr key={item._id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '18px 24px', fontWeight: '600', color: BRAND_DARK }}>{item.itemName}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <button onClick={() => handleUpdateQty(item._id, item.quantity, -1)} style={{ padding: '4px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}><Minus size={14}/></button>
                          <span style={{ minWidth: '30px', fontWeight: '800', color: isLow ? '#EF4444' : BRAND_DARK }}>{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item._id, item.quantity, 1)} style={{ padding: '4px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}><Plus size={14}/></button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: '#64748B' }}>{item.reorderThreshold}</td>
                      <td style={{ textAlign: 'center' }}>
                        {item.supplierUrl ? (
                          <a href={item.supplierUrl} target="_blank" rel="noreferrer" style={{ color: BRAND_ACTION }}><ExternalLink size={18} /></a>
                        ) : <span style={{ color: '#CBD5E1' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. ALERTS PANEL */}
        <div className="no-print" style={{ backgroundColor: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", height: 'fit-content' }}>
          <h3 style={{ marginBottom: "20px", color: BRAND_DARK, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={22} color="#EF4444" /> Live Alerts
          </h3>
          <AlertsPanel inventory={inventory} />
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-area { padding: 0 !important; background: white !important; }
          table { width: 100% !important; border: 1px solid #eee !important; }
        }
      `}</style>
    </div>
  );
}
