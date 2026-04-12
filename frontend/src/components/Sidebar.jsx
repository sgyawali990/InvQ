import React from 'react';
import { Link } from 'react-router-dom';
<ul>
  <li><Link to="/inventory">Inventory</Link></li>
  <li><Link to="/settings">Settings</Link></li>
  <li><Link to="/create-product">Add Product</Link></li>
  <li><Link to="/alerts">Alerts</Link></li>
</ul>

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const sidebarStyle = {
    width: isOpen ? '260px' : '0px', 
    height: '100vh',
    backgroundColor: '#083344',
    color: 'white',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowX: 'hidden',
    transition: '0.3s', 
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: isOpen ? '20px' : '0px'
  };

  const linkStyle = {
    padding: '15px 25px',
    textDecoration: 'none',
    color: 'white',
    display: 'block',
    fontSize: '18px',
    transition: '0.2s'
  };

  return (
    <div style={sidebarStyle}>
     
      <button 
        onClick={toggleSidebar}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'white', 
          fontSize: '24px', 
          cursor: 'pointer',
          alignSelf: 'flex-end',
          marginRight: '20px'
        }}
      >
        ×
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>InvQ</h2>

      <Link to="/dashboard" style={linkStyle} onClick={toggleSidebar}>Dashboard</Link>
      <Link to="/inventory" style={linkStyle} onClick={toggleSidebar}>Inventory</Link>

      <Link to="/alerts" style={linkStyle} onClick={toggleSidebar}>Alerts</Link>
      <Link to="/settings" style={linkStyle} onClick={toggleSidebar}>Settings</Link>
    </div>
  );
};

export default Sidebar;