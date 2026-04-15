import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import CreateProduct from "./pages/CreateProduct";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AlertsPanel from "./components/Alerts/AlertsPanel";
import Layout from "./components/Layout"; 

import "./index.css";

const isLoggedIn = () => {
  return !!localStorage.getItem("invq_token");
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
};

const App = () => {
  return (
    /* HashRouter does not need a 'basename' prop like BrowserRouter does */
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Inventory Route */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout><CreateProduct /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Alerts Route */}
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout><AlertsPanel /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App /> 
  </React.StrictMode>
);