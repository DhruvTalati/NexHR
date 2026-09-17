import React, { useEffect,useCallback, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import LeaveService from "../services/LeaveService";
import { getErrorMessage } from "../api/axiosClient";

const LEAVE_TYPES = [
  {
    value: "CASUAL",
    label: "Casual Leave",
  },
  {
    value: "SICK",
    label: "Sick Leave",
  },
  {
    value: "ANNUAL",
    label: "Annual Leave",
  },
  {
    value: "UNPAID",
    label: "Unpaid Leave",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "leave-status-pending",
  },
  APPROVED: {
    label: "Approved",
    className: "leave-status-approved",
  },
  REJECTED: {
    label: "Rejected",
    className: "leave-status-rejected",
  },
};

function formatLeaveType(type) {
  if (!type) {
    return "Leave";
  }

  return String(type)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatus(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className: "leave-status-default",
    }
  );
}

export default function LeavePage() {
  const { user } = useAuth();

  const isEmployee = user?.role === "EMPLOYEE";
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [dashboard, setDashboard] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const [showApplyForm, setShowApplyForm] = useState(false);

  const [form, setForm] = useState({
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadEmployeeData = async () => {
    try {
      setError("");

      const [leavesResponse, balancesResponse] = await Promise.all([
        LeaveService.getMyLeaves(),
        LeaveService.getMyBalances(),
      ]);

      setMyLeaves(leavesResponse.data || []);

      setLeaveBalances(balancesResponse.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loadAdminData = async () => {
    try {
      setError("");

      const [allResponse, pendingResponse, dashboardResponse] =
        await Promise.all([
          LeaveService.getAllLeaves(),
          LeaveService.getPendingLeaves(),
          LeaveService.getDashboard(),
        ]);

      setAllLeaves(allResponse.data || []);
      setPendingLeaves(pendingResponse.data || []);
      setDashboard(
        dashboardResponse.data || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);

      if (isEmployee) {
        await loadEmployeeData();
      } else if (isAdminOrHr) {
        await loadAdminData();
      }
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      if (isEmployee) {
        await loadEmployeeData();
      } else if (isAdminOrHr) {
        await loadAdminData();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleApplyLeave = async (event) => {
    event.preventDefault();

    if (!form.startDate || !form.endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (form.startDate > form.endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await LeaveService.applyLeave(form);

      setForm({
        leaveType: "CASUAL",
        startDate: "",
        endDate: "",
        reason: "",
      });

      setShowApplyForm(false);

      await loadEmployeeData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this pending leave request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(leaveId);
      setError("");

      await LeaveService.cancelLeave(leaveId);

      setMyLeaves((current) => current.filter((leave) => leave.id !== leaveId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      setActionId(leaveId);
      setError("");

      await LeaveService.approveLeave(leaveId);

      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();

    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }

    try {
      setActionId(rejectingId);
      setError("");

      await LeaveService.rejectLeave(rejectingId, rejectionReason.trim());

      setRejectingId(null);
      setRejectionReason("");

      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = myLeaves.filter(
    (leave) => leave.status === "PENDING",
  ).length;

  const approvedCount = myLeaves.filter(
    (leave) => leave.status === "APPROVED",
  ).length;

  const rejectedCount = myLeaves.filter(
    (leave) => leave.status === "REJECTED",
  ).length;

  if (loading) {
    return (
      <div className="leave-page">
        <div className="leave-loading">Loading leave management...</div>
      </div>
    );
  }

  return (
    <div className="leave-page">
      {/* Header */}

      <div className="leave-page-header">
        <div>
          <div className="page-eyebrow">
            {isEmployee ? "SELF SERVICE" : "HR OPERATIONS"}
          </div>

          <h1 className="page-title">Leave Management</h1>

          <p className="page-description">
            {isEmployee
              ? "Apply for leave and track your leave requests."
              : "Review, approve, and manage employee leave requests."}
          </p>
        </div>

        <button
          type="button"
          className="leave-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? "leave-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <div className="leave-error">{error}</div>}

      {/* EMPLOYEE */}

      {isEmployee && (
        <>
          {/* Summary */}

          <div className="leave-summary-grid">
            <div className="leave-summary-card">
              <div className="leave-summary-icon blue">
                <FileText size={18} />
              </div>

              <div>
                <span>Total Requests</span>
                <strong>{myLeaves.length}</strong>
              </div>
            </div>

            <div className="leave-summary-card">
              <div className="leave-summary-icon orange">
                <Clock3 size={18} />
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="leave-summary-card">
              <div className="leave-summary-icon green">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </div>
            </div>

            <div className="leave-summary-card">
              <div className="leave-summary-icon red">
                <XCircle size={18} />
              </div>

              <div>
                <span>Rejected</span>
                <strong>{rejectedCount}</strong>
              </div>
            </div>
          </div>

          {/* Leave Balance */}

          <section className="leave-section-card">
            <div className="leave-section-header">
              <div>
                <h2>Leave Balance</h2>

                <p>Your available paid leave balance.</p>
              </div>
            </div>

            <div className="leave-balance-grid">
              {leaveBalances.length === 0 ? (
                <div className="leave-balance-loading">
                  Loading leave balances...
                </div>
              ) : (
                leaveBalances.map((balance) => (
                  <div className="leave-balance-card" key={balance.id}>
                    <div className="leave-balance-card-top">
                      <div>
                        <span>{formatLeaveType(balance.leaveType)}</span>

                        <strong>{balance.remainingDays}</strong>

                        <small>days remaining</small>
                      </div>

                      <div className="leave-balance-circle">
                        {balance.remainingDays}
                      </div>
                    </div>

                    <div className="leave-balance-progress">
                      <div
                        className="leave-balance-progress-bar"
                        style={{
                          width: `${
                            balance.allocatedDays > 0
                              ? Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    (balance.remainingDays /
                                      balance.allocatedDays) *
                                      100,
                                  ),
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="leave-balance-footer">
                      <span>Used: {balance.usedDays}</span>

                      <span>Allocated: {balance.allocatedDays}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Apply */}

          <section className="leave-section-card">
            <div className="leave-section-header">
              <div>
                <h2>Apply for Leave</h2>
                <p>Submit a new leave request for HR approval.</p>
              </div>

              {!showApplyForm && (
                <button
                  type="button"
                  className="leave-primary-button"
                  onClick={() => {
                    setError("");
                    setShowApplyForm(true);
                  }}
                >
                  <Send size={15} />
                  Apply Leave
                </button>
              )}
            </div>

            {showApplyForm && (
              <form className="leave-form" onSubmit={handleApplyLeave}>
                <div className="leave-form-grid">
                  <div className="leave-field">
                    <label htmlFor="leaveType">Leave Type</label>

                    <select
                      id="leaveType"
                      name="leaveType"
                      value={form.leaveType}
                      onChange={handleFormChange}
                    >
                      {LEAVE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="leave-field">
                    <label htmlFor="startDate">Start Date</label>

                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="leave-field">
                    <label htmlFor="endDate">End Date</label>

                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="leave-field leave-field-full">
                    <label htmlFor="reason">Reason</label>

                    <textarea
                      id="reason"
                      name="reason"
                      rows="4"
                      value={form.reason}
                      onChange={handleFormChange}
                      placeholder="Explain the reason for your leave..."
                    />
                  </div>
                </div>

                <div className="leave-form-actions">
                  <button
                    type="button"
                    className="leave-secondary-button"
                    onClick={() => {
                      setShowApplyForm(false);
                      setError("");
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="leave-primary-button"
                    disabled={submitting}
                  >
                    <Send size={15} />

                    {submitting ? "Submitting..." : "Submit Leave Request"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* My Requests */}

          <section className="leave-section-card">
            <div className="leave-section-header">
              <div>
                <h2>My Leave Requests</h2>
                <p>Review the status of your previous requests.</p>
              </div>
            </div>

            {myLeaves.length === 0 ? (
              <div className="leave-empty">
                <CalendarDays size={28} />

                <h3>No leave requests yet</h3>

                <p>Your leave requests will appear here.</p>
              </div>
            ) : (
              <div className="leave-table-wrapper">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Period</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {myLeaves.map((leave) => {
                      const status = getStatus(leave.status);

                      return (
                        <tr key={leave.id}>
                          <td>
                            <strong>{formatLeaveType(leave.leaveType)}</strong>
                          </td>

                          <td>
                            {formatDate(leave.startDate)} →{" "}
                            {formatDate(leave.endDate)}
                          </td>

                          <td>{leave.totalDays}</td>

                          <td className="leave-reason-cell">
                            {leave.reason || "—"}
                          </td>

                          <td>
                            <span
                              className={`leave-status-badge ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td>
                            {leave.status === "PENDING" && (
                              <button
                                type="button"
                                className="leave-table-action"
                                disabled={actionId === leave.id}
                                onClick={() => handleCancelLeave(leave.id)}
                              >
                                Cancel
                              </button>
                            )}

                            {leave.status === "REJECTED" &&
                              leave.rejectionReason && (
                                <span className="leave-rejection-text">
                                  {leave.rejectionReason}
                                </span>
                              )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ADMIN / HR */}

      {isAdminOrHr && (
        <>
          {/* Dashboard */}

          <div className="leave-summary-grid">
            <div className="leave-summary-card">
              <div className="leave-summary-icon blue">
                <FileText size={18} />
              </div>

              <div>
                <span>Total Requests</span>
                <strong>{dashboard.total}</strong>
              </div>
            </div>

            <div className="leave-summary-card">
              <div className="leave-summary-icon orange">
                <Clock3 size={18} />
              </div>

              <div>
                <span>Pending</span>
                <strong>{dashboard.pending}</strong>
              </div>
            </div>

            <div className="leave-summary-card">
              <div className="leave-summary-icon green">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <span>Approved</span>
                <strong>{dashboard.approved}</strong>
              </div>
            </div>

            <div className="leave-summary-card">
              <div className="leave-summary-icon red">
                <XCircle size={18} />
              </div>

              <div>
                <span>Rejected</span>
                <strong>{dashboard.rejected}</strong>
              </div>
            </div>
          </div>

          {/* Pending Requests */}

          <section className="leave-section-card">
            <div className="leave-section-header">
              <div>
                <h2>Pending Requests</h2>
                <p>Leave requests waiting for HR or Admin review.</p>
              </div>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="leave-empty">
                <CheckCircle2 size={28} />

                <h3>No pending requests</h3>

                <p>All leave requests are currently reviewed.</p>
              </div>
            ) : (
              <div className="leave-table-wrapper">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Period</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingLeaves.map((leave) => {
                      const busy = actionId === leave.id;

                      return (
                        <tr key={leave.id}>
                          <td>
                            <strong>{leave.employeeName || "Employee"}</strong>

                            <small className="leave-employee-code">
                              {leave.employeeCode || "—"}
                            </small>
                          </td>

                          <td>{formatLeaveType(leave.leaveType)}</td>

                          <td>
                            {formatDate(leave.startDate)} →{" "}
                            {formatDate(leave.endDate)}
                          </td>

                          <td>{leave.totalDays}</td>

                          <td className="leave-reason-cell">
                            {leave.reason || "—"}
                          </td>

                          <td>
                            <span className="leave-status-badge leave-status-pending">
                              Pending
                            </span>
                          </td>

                          <td>
                            <div className="leave-action-group">
                              <button
                                type="button"
                                className="leave-approve-button"
                                disabled={busy}
                                onClick={() => handleApprove(leave.id)}
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>

                              <button
                                type="button"
                                className="leave-reject-button"
                                disabled={busy}
                                onClick={() => {
                                  setRejectingId(leave.id);
                                  setRejectionReason("");
                                  setError("");
                                }}
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* All Requests */}

          <section className="leave-section-card">
            <div className="leave-section-header">
              <div>
                <h2>All Leave Requests</h2>
                <p>Complete leave request history across the organization.</p>
              </div>
            </div>

            {allLeaves.length === 0 ? (
              <div className="leave-empty">
                <FileText size={28} />

                <h3>No leave records</h3>
              </div>
            ) : (
              <div className="leave-table-wrapper">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Period</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allLeaves.map((leave) => {
                      const status = getStatus(leave.status);

                      return (
                        <tr key={leave.id}>
                          <td>
                            <strong>{leave.employeeName || "Employee"}</strong>

                            <small className="leave-employee-code">
                              {leave.employeeCode || "—"}
                            </small>
                          </td>

                          <td>{formatLeaveType(leave.leaveType)}</td>

                          <td>
                            {formatDate(leave.startDate)} →{" "}
                            {formatDate(leave.endDate)}
                          </td>

                          <td>{leave.totalDays}</td>

                          <td>
                            <span
                              className={`leave-status-badge ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td>{leave.reviewedBy || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Reject Modal */}

      {rejectingId && (
        <div className="leave-modal-backdrop">
          <div className="leave-modal">
            <div className="leave-modal-header">
              <div>
                <h3>Reject Leave Request</h3>

                <p>Provide a reason that will be visible to the employee.</p>
              </div>

              <button
                type="button"
                className="leave-modal-close"
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason("");
                }}
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleReject}>
              <textarea
                rows="5"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Enter rejection reason..."
              />

              <div className="leave-form-actions">
                <button
                  type="button"
                  className="leave-secondary-button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-reject-submit"
                  disabled={!rejectionReason.trim() || actionId === rejectingId}
                >
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
