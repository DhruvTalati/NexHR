import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  BriefcaseBusiness,
  Wallet,
  UserRound,
} from "lucide-react";

import EmployeeDocuments from "../components/EmployeeDocuments";
import EmployeeService from "../services/EmployeeService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

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

function InfoItem({ icon, label, value }) {
  return (
    <div className="profile-info-item">
      <div className="profile-info-icon">{icon}</div>

      <div className="profile-info-content">
        <div className="profile-info-label">{label}</div>

        <div className="profile-info-value">{value || "—"}</div>
      </div>
    </div>
  );
}

function getInitials(employee) {
  const first = employee?.firstName?.charAt(0)?.toUpperCase() || "";

  const last = employee?.lastName?.charAt(0)?.toUpperCase() || "";

  return `${first}${last}` || "U";
}

function formatValue(value) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function EmployeeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    EmployeeService.getEmployeeById(id)
      .then((res) => {
        setEmployee(res.data);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="profile-state">
        <LoadingSpinner label="Loading employee..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-state">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="profile-state">
        <ErrorMessage message="Employee information could not be found." />
      </div>
    );
  }

  const status = STATUS_CONFIG[employee.status] || {
    label: formatValue(employee.status),
    className: "profile-status-default",
  };

  return (
    <div className="employee-profile-page">
      {/* Back */}

      <button
        type="button"
        className="profile-back-button"
        onClick={() => navigate("/employees")}
      >
        <ArrowLeft size={15} />
        Back to Employees
      </button>

      {/* Profile Hero */}

      <section className="employee-profile-hero">
        <div className="profile-hero-main">
          <div className="profile-avatar-large">{getInitials(employee)}</div>

          <div className="profile-identity">
            <div className="profile-eyebrow">EMPLOYEE PROFILE</div>

            <h1>
              {employee.firstName} {employee.lastName}
            </h1>

            <p>{employee.designation || "Employee"}</p>

            <div className="profile-meta">
              <span>{employee.employeeCode || `Employee #${employee.id}`}</span>

              <span className="profile-meta-separator">•</span>

              <span>{employee.department || "No Department"}</span>
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          <span className={`profile-status-badge ${status.className}`}>
            <span className="profile-status-dot" />
            {status.label}
          </span>

          <button
            type="button"
            className="profile-edit-button"
            onClick={() => navigate(`/employees/${id}/edit`)}
          >
            <Pencil size={15} />
            Edit Employee
          </button>
        </div>
      </section>

      <EmployeeDocuments employeeId={employee.id} />

      {/* Key information */}

      <div className="profile-highlight-grid">
        <div className="profile-highlight-card">
          <div className="profile-highlight-icon blue">
            <BriefcaseBusiness size={18} />
          </div>

          <div>
            <div className="profile-highlight-label">Department</div>

            <div className="profile-highlight-value">
              {employee.department || "—"}
            </div>
          </div>
        </div>

        <div className="profile-highlight-card">
          <div className="profile-highlight-icon green">
            <CalendarDays size={18} />
          </div>

          <div>
            <div className="profile-highlight-label">Date of Joining</div>

            <div className="profile-highlight-value">
              {employee.dateOfJoining || "—"}
            </div>
          </div>
        </div>

        <div className="profile-highlight-card">
          <div className="profile-highlight-icon orange">
            <Wallet size={18} />
          </div>

          <div>
            <div className="profile-highlight-label">Annual Salary</div>

            <div className="profile-highlight-value">
              {employee.salary != null
                ? `₹${Number(employee.salary).toLocaleString("en-IN")}`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Main information */}

      <div className="profile-content-grid">
        {/* Personal */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-heading-icon">
              <UserRound size={17} />
            </div>

            <div>
              <h2>Personal Information</h2>

              <p>Basic personal details of the employee.</p>
            </div>
          </div>

          <div className="profile-info-grid">
            <InfoItem
              icon={<Mail size={16} />}
              label="Email Address"
              value={employee.email}
            />

            <InfoItem
              icon={<Phone size={16} />}
              label="Phone Number"
              value={employee.phone}
            />

            <InfoItem
              icon={<CalendarDays size={16} />}
              label="Date of Birth"
              value={employee.dateOfBirth}
            />

            <InfoItem
              icon={<MapPin size={16} />}
              label="City"
              value={employee.city}
            />
          </div>
        </section>

        {/* Employment */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-heading-icon">
              <BriefcaseBusiness size={17} />
            </div>

            <div>
              <h2>Employment Details</h2>

              <p>Current role and employment information.</p>
            </div>
          </div>

          <div className="profile-details-list">
            <div className="profile-detail-row">
              <span>Employee Code</span>

              <strong>{employee.employeeCode || "—"}</strong>
            </div>

            <div className="profile-detail-row">
              <span>Designation</span>

              <strong>{employee.designation || "—"}</strong>
            </div>

            <div className="profile-detail-row">
              <span>Department</span>

              <strong>{employee.department || "—"}</strong>
            </div>

            <div className="profile-detail-row">
              <span>Employment Type</span>

              <strong>{formatValue(employee.employmentType)}</strong>
            </div>

            <div className="profile-detail-row">
              <span>Date of Joining</span>

              <strong>{employee.dateOfJoining || "—"}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* Address */}

      <section className="profile-section-card profile-address-card">
        <div className="profile-section-header">
          <div className="profile-section-heading-icon">
            <MapPin size={17} />
          </div>

          <div>
            <h2>Address Information</h2>

            <p>Employee location and contact address.</p>
          </div>
        </div>

        <div className="profile-address-content">
          <div className="profile-address-main">
            {employee.address || "No address provided"}
          </div>

          <div className="profile-address-location">
            {[employee.city, employee.country].filter(Boolean).join(", ") ||
              "Location not provided"}
          </div>
        </div>
      </section>

      {/* Footer actions */}

      <div className="profile-bottom-actions">
        <Link to="/employees" className="profile-secondary-button">
          <ArrowLeft size={15} />
          Back to Employees
        </Link>

        <button
          type="button"
          className="profile-primary-button"
          onClick={() => navigate(`/employees/${id}/edit`)}
        >
          <Pencil size={15} />
          Edit Employee
        </button>
      </div>
    </div>
  );
}
