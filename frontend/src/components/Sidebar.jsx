import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("invq_token");
    localStorage.removeItem("invq_user_name");
    window.location.href = "/InvQ/";
  };

  const sidebarStyle = {
    width: isOpen ? '260px' : '0px',
    height: '100vh',
    background: 'linear-gradient(180deg, #083344, #022c22)',
    color: 'white',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowX: 'hidden',
    transition: '0.35s ease',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: isOpen ? '20px' : '0px',
    boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.2)' : 'none'
  };

  const linkStyle = {
    padding: '14px 28px',
    textDecoration: 'none',
    color: 'white',
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    margin: '4px 12px',
    transition: 'all 0.25s ease'
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

      {/* Dashboard Link */}
      <Link
        to="/dashboard"
        style={linkStyle}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateX(6px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        Dashboard
      </Link>

      {/* Inventory Link */}
      <Link
        to="/inventory"
        style={linkStyle}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateX(6px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        Inventory
      </Link>

      {/* Alerts Link */}
      <Link
        to="/alerts"
        style={linkStyle}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateX(6px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        Alerts
      </Link>

      {/* Settings Link */}
      <Link
        to="/settings"
        style={linkStyle}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateX(6px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        Settings
      </Link>

      {/* LOGOUT BUTTON SECTION */}
      <div style={{
        marginTop: "auto",
        padding: "20px",
        paddingBottom: "50px"
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#EF4444",
            color: "white",
            fontWeight: "800",
            cursor: "pointer",
            transition: "all 0.25s ease", 
            boxShadow: "0 6px 16px rgba(239, 68, 68, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.backgroundColor = "#dc2626";
            e.currentTarget.style.boxShadow = "0 10px 22px rgba(220, 38, 38, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.backgroundColor = "#EF4444";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.3)";
          }}
        >
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;