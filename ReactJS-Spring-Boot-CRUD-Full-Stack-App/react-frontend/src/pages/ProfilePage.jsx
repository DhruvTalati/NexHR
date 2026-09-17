import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  Phone,
  LockKeyhole,
} from "lucide-react";

import MyDocuments from "../components/MyDocuments";
import EmployeeService from "../services/EmployeeService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

const ROLE_CONFIG = {
  ADMIN: {
    label: "Administrator",
    className: "profile-role-admin",
  },
  HR: {
    label: "HR Manager",
    className: "profile-role-hr",
  },
  EMPLOYEE: {
    label: "Employee",
    className: "profile-role-employee",
  },
};

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    className: "profile-status-active",
  },
  INACTIVE: {
    label: "Inactive",
    className: "profile-status-inactive",
  },
  ON_LEAVE: {
    label: "On Leave",
    className: "profile-status-leave",
  },
  TERMINATED: {
    label: "Terminated",
    className: "profile-status-terminated",
  },
};

function getInitials(employee, user) {
  const first =
    employee?.firstName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "";

  const last = employee?.lastName?.charAt(0)?.toUpperCase() || "";

  return `${first}${last}` || "U";
}

function formatValue(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    EmployeeService.getMyProfile()
      .then((res) => {
        setEmployee(res.data);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setEmployee(null);
        } else {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="profile-page-state">
        <LoadingSpinner label="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-state">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const role = ROLE_CONFIG[user?.role] || {
    label: formatValue(user?.role),
    className: "profile-role-default",
  };

  const status = STATUS_CONFIG[employee?.status] || {
    label: formatValue(employee?.status),
    className: "profile-status-default",
  };

  const displayName = employee
    ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim()
    : user?.email || "User";

  return (
    <div className="my-profile-page">
      {/* Header */}

      <div className="my-profile-header">
        <div>
          <div className="page-eyebrow">ACCOUNT</div>

          <h1 className="page-title">My Profile</h1>

          <p className="page-description">
            View your account information and employee details.
          </p>
        </div>
      </div>

      {/* Hero */}

      <section className="my-profile-hero">
        <div className="my-profile-hero-main">
          <div className="my-profile-avatar">{getInitials(employee, user)}</div>

          <div className="my-profile-identity">
            <div className="my-profile-eyebrow">
              {employee ? "EMPLOYEE ACCOUNT" : "USER ACCOUNT"}
            </div>

            <h2>{displayName}</h2>

            {employee?.designation && <p>{employee.designation}</p>}

            <div className="my-profile-meta">
              <span>
                <Mail size={12} />
                {user?.email}
              </span>

              <span>
                <ShieldCheck size={12} />
                {role.label}
              </span>
            </div>
          </div>
        </div>

        <div className="my-profile-role-badge">
          <span className="role-dot" />
          {role.label}
        </div>
      </section>

      {/* Account information */}

      <div className="my-profile-grid">
        <section className="my-profile-card">
          <div className="my-profile-card-header">
            <div className="my-profile-card-icon blue">
              <ShieldCheck size={17} />
            </div>

            <div>
              <h3>Account Information</h3>

              <p>Your login and access information.</p>
            </div>
          </div>

          <div className="my-profile-detail-list">
            <div className="my-profile-detail">
              <span>Account Email</span>

              <strong>{user?.email || "—"}</strong>
            </div>

            <div className="my-profile-detail">
              <span>Access Level</span>

              <strong>{role.label}</strong>
            </div>

            <div className="my-profile-detail">
              <span>Authentication</span>

              <strong className="secure-value">
                <LockKeyhole size={13} />
                JWT Secured
              </strong>
            </div>
          </div>
        </section>

        {employee && (
          <section className="my-profile-card">
            <div className="my-profile-card-header">
              <div className="my-profile-card-icon green">
                <BriefcaseBusiness size={17} />
              </div>

              <div>
                <h3>Employment Summary</h3>

                <p>Your current workplace information.</p>
              </div>
            </div>

            <div className="my-profile-detail-list">
              <div className="my-profile-detail">
                <span>Employee Code</span>

                <strong>{employee.employeeCode || "—"}</strong>
              </div>

              <div className="my-profile-detail">
                <span>Department</span>

                <strong>{employee.department || "—"}</strong>
              </div>

              <div className="my-profile-detail">
                <span>Employment Type</span>

                <strong>{formatValue(employee.employmentType)}</strong>
              </div>

              <div className="my-profile-detail">
                <span>Status</span>

                <strong className="profile-inline-status">
                  <span className={`profile-inline-dot ${status.className}`} />
                  {status.label}
                </strong>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Employee details */}

      {employee ? (
        <>
          <section className="my-profile-card my-profile-details-card">
            <div className="my-profile-card-header">
              <div className="my-profile-card-icon purple">
                <UserRound size={17} />
              </div>

              <div>
                <h3>Personal Details</h3>

                <p>Information associated with your employee record.</p>
              </div>
            </div>

            <div className="my-profile-info-grid">
              <div className="my-profile-info-item">
                <div className="my-profile-info-icon">
                  <UserRound size={15} />
                </div>

                <div>
                  <span>Full Name</span>

                  <strong>{displayName}</strong>
                </div>
              </div>

              <div className="my-profile-info-item">
                <div className="my-profile-info-icon">
                  <Mail size={15} />
                </div>

                <div>
                  <span>Email</span>

                  <strong>{employee.email || user?.email || "—"}</strong>
                </div>
              </div>

              <div className="my-profile-info-item">
                <div className="my-profile-info-icon">
                  <Phone size={15} />
                </div>

                <div>
                  <span>Phone</span>

                  <strong>{employee.phone || "—"}</strong>
                </div>
              </div>

              <div className="my-profile-info-item">
                <div className="my-profile-info-icon">
                  <CalendarDays size={15} />
                </div>

                <div>
                  <span>Date of Birth</span>

                  <strong>{employee.dateOfBirth || "—"}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="my-profile-card my-profile-details-card">
            <div className="my-profile-card-header">
              <div className="my-profile-card-icon orange">
                <MapPin size={17} />
              </div>

              <div>
                <h3>Location</h3>

                <p>Your registered contact location.</p>
              </div>
            </div>

            <div className="my-profile-location">
              <div className="my-profile-location-main">
                {employee.address || "No address provided"}
              </div>

              <div className="my-profile-location-sub">
                {[employee.city, employee.country].filter(Boolean).join(", ") ||
                  "Location not provided"}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="my-profile-empty">
          <div className="my-profile-empty-icon">
            <UserRound size={28} />
          </div>

          <h3>Employee record not linked</h3>

          <p>
            Your account is active, but no employee record is currently linked
            to it. Contact HR to have your employee profile set up.
          </p>
        </section>
      )}

      {employee && <MyDocuments />}

      {/* Bottom */}

      <div className="my-profile-footer-note">
        <ShieldCheck size={14} />

        <span>
          Your account access is protected by role-based authorization.
        </span>
      </div>
    </div>
  );
}
