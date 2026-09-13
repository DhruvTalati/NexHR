import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  Settings,
  CalendarCheck2,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  const isAdminOrHr = user && (user.role === "ADMIN" || user.role === "HR");

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">N</div>

        <div>
          <div className="brand-name">NexHR</div>

          <div className="brand-subtitle">HR OPERATIONS</div>
        </div>
      </div>

      <div className="nav-section-title">WORKSPACE</div>

      <nav className="sidebar-nav">
        {isAdminOrHr && (
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        )}

        {isAdminOrHr && (
          <NavLink to="/employees" className={linkClass}>
            <Users size={18} />
            <span>Employees</span>
          </NavLink>
        )}

        {isAdminOrHr && (
          <NavLink to="/departments" className={linkClass}>
            <Building2 size={18} />
            <span>Departments</span>
          </NavLink>
        )}

        <NavLink to="/attendance" className={linkClass}>
          <CalendarCheck2 size={18} />
          <span>Attendance</span>
        </NavLink>

        <NavLink to="/leaves" className={linkClass}>
          <CalendarDays size={18} />
          <span>Leave</span>
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <UserCircle size={18} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="nav-section-title">SYSTEM</div>

      <nav className="sidebar-nav">
        <NavLink to="/profile" className={linkClass}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>

          <div>
            <div className="user-name">{user?.email || "Administrator"}</div>

            <div className="user-role">{user?.role || "USER"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
