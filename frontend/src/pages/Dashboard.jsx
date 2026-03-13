import { useEffect, useState } from "react";
import InventoryTable from "../components/inventory/InventoryTable";
import AlertsPanel from "../components/Alerts/AlertsPanel";

export default function Dashboard(){

  const [inventory,setInventory] = useState([]);

  useEffect(()=>{

    const fetchInventory = async ()=>{
      const token = localStorage.getItem("invq_token");

      const res = await fetch("/api/inventory",{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      const data = await res.json();
      setInventory(data);
    };

    fetchInventory();

  },[]);

  return(
    <div className="dashboard">

      <div className="inventory-section">
        <h2>Inventory</h2>
        <InventoryTable
          inventory={inventory}
          setInventory={setInventory}
        />
      </div>

      <div className="alerts-section">
        <AlertsPanel inventory={inventory}/>
      </div>

    </div>
  );
}