import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AUTH_STORAGE_KEY } from "./config";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";

const isAuthenticated = () => {
  return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};
function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/auth/:id" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated() ? "/home" : "/welcome"} replace />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/:boardId"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}

export default App;
