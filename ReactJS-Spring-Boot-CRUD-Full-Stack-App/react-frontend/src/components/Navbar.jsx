import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <div className="topbar-title">Employee Management System</div>

        <div className="topbar-subtitle">
          Human Resources &amp; Workforce Management
        </div>
      </div>

      <div className="topbar-actions">
        {isAuthenticated ? (
          <>
            <button type="button" className="icon-button" title="Notifications">
              <Bell size={19} />
            </button>

            <div className="topbar-user">
              <div className="avatar">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>

              <div className="topbar-user-details">
                <div className="topbar-user-name">{user?.email}</div>

                <div className="topbar-user-role">{user?.role}</div>
              </div>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="primary-button">
            <UserCircle size={17} />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
