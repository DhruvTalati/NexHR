import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import LeavePage from "./pages/LeavePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesListPage from "./pages/EmployeesListPage";
import EmployeeCreatePage from "./pages/EmployeeCreatePage";
import EmployeeEditPage from "./pages/EmployeeEditPage";
import EmployeeViewPage from "./pages/EmployeeViewPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ProfilePage from "./pages/ProfilePage";
import AttendancePage from "./pages/AttendancePage";
import NotFoundPage from "./pages/NotFoundPage";

const ADMIN_HR = ["ADMIN", "HR"];

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "ADMIN" || user?.role === "HR") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/profile" replace />;
}

function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <HomeRedirect />;
  }

  return children;
}

function withLayout(element) {
  return <Layout>{element}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Login */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />

      {/* Register */}
      <Route
        path="/register"
        element={
          <RedirectIfAuthenticated>
            <RegisterPage />
          </RedirectIfAuthenticated>
        }
      />

      {/* =========================
              ADMIN / HR ROUTES
          ========================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={ADMIN_HR}>
            {withLayout(<DashboardPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={ADMIN_HR}>
            {withLayout(<EmployeesListPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/new"
        element={
          <ProtectedRoute allowedRoles={ADMIN_HR}>
            {withLayout(<EmployeeCreatePage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute allowedRoles={ADMIN_HR}>
            {withLayout(<EmployeeViewPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute allowedRoles={ADMIN_HR}>
            {withLayout(<EmployeeEditPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/departments"
        element={
          <ProtectedRoute allowedRoles={ADMIN_HR}>
            {withLayout(<DepartmentsPage />)}
          </ProtectedRoute>
        }
      />

      {/* =========================
             ALL AUTHENTICATED USERS
          ========================== */}

      <Route
        path="/profile"
        element={<ProtectedRoute>{withLayout(<ProfilePage />)}</ProtectedRoute>}
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>{withLayout(<AttendancePage />)}</ProtectedRoute>
        }
      />
      <Route
        path="/leaves"
        element={<ProtectedRoute>{withLayout(<LeavePage />)}</ProtectedRoute>}
      />

      {/* Not Found */}
      <Route path="*" element={withLayout(<NotFoundPage />)} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
