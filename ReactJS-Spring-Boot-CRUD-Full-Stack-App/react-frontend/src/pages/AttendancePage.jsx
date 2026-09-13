import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import AttendanceService from "../services/AttendanceService";
import EmployeeService from "../services/EmployeeService";
import { getErrorMessage } from "../api/axiosClient";

const STATUS_CONFIG = {
  PRESENT: {
    label: "Present",
    className: "attendance-status-present",
  },
  LATE: {
    label: "Late",
    className: "attendance-status-late",
  },
  HALF_DAY: {
    label: "Half Day",
    className: "attendance-status-half-day",
  },
  ABSENT: {
    label: "Absent",
    className: "attendance-status-absent",
  },
};

function formatStatus(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className: "attendance-status-default",
    }
  );
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHours(value) {
  if (value == null) {
    return "—";
  }

  return `${Number(value).toFixed(2)} hrs`;
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

export default function AttendancePage() {
  const { user } = useAuth();

  const isEmployee = user?.role === "EMPLOYEE";
  const isAdminOrHr = user?.role === "ADMIN" || user?.role === "HR";

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [allTodayAttendance, setAllTodayAttendance] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [employeeHistoryLoading, setEmployeeHistoryLoading] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    absent: 0,
    attendancePercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEmployeeAttendance = async () => {
    try {
      setError("");

      const [todayResponse, historyResponse] = await Promise.all([
        AttendanceService.getTodayAttendance(),
        AttendanceService.getMyHistory(),
      ]);

      setTodayAttendance(todayResponse.data);
      setMyHistory(historyResponse.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loadEmployeesForAdmin = async () => {
    try {
      const response = await EmployeeService.getEmployees({
        page: 0,
        size: 100,
        sortBy: "id",
        sortDirection: "ASC",
      });

      const employeeList = response.data?.content || response.data || [];

      setEmployees(employeeList);

      if (!selectedEmployeeId && employeeList.length > 0) {
        setSelectedEmployeeId(String(employeeList[0].id));
      }
    } catch (err) {
      throw err;
    }
  };

  const loadEmployeeHistory = async (employeeId) => {
    if (!employeeId) {
      setEmployeeHistory([]);
      return;
    }

    try {
      setEmployeeHistoryLoading(true);
      setError("");

      const response =
        await AttendanceService.getEmployeeAttendance(employeeId);

      setEmployeeHistory(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setEmployeeHistory([]);
    } finally {
      setEmployeeHistoryLoading(false);
    }
  };

  const loadAdminAttendance = async () => {
    try {
      setError("");

      const [attendanceResponse, dashboardResponse] = await Promise.all([
        AttendanceService.getTodayAllAttendance(),
        AttendanceService.getDashboardStats(),
      ]);

      setAllTodayAttendance(attendanceResponse.data || []);

      setDashboardStats({
        totalEmployees: dashboardResponse.data?.totalEmployees || 0,
        present: dashboardResponse.data?.present || 0,
        late: dashboardResponse.data?.late || 0,
        halfDay: dashboardResponse.data?.halfDay || 0,
        absent: dashboardResponse.data?.absent || 0,
        attendancePercentage: dashboardResponse.data?.attendancePercentage || 0,
      });

      if (employees.length === 0) {
        await loadEmployeesForAdmin();
      }

      if (selectedEmployeeId) {
        await loadEmployeeHistory(selectedEmployeeId);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loadPage = async () => {
    try {
      setLoading(true);

      if (isEmployee) {
        await loadEmployeeAttendance();
      } else if (isAdminOrHr) {
        await loadEmployeesForAdmin();
        await loadAdminAttendance();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (isAdminOrHr && selectedEmployeeId) {
      loadEmployeeHistory(selectedEmployeeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      if (isEmployee) {
        await loadEmployeeAttendance();
      } else if (isAdminOrHr) {
        await loadAdminAttendance();

        if (selectedEmployeeId) {
          await loadEmployeeHistory(selectedEmployeeId);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await AttendanceService.checkIn();

      setTodayAttendance(response.data);

      const historyResponse = await AttendanceService.getMyHistory();

      setMyHistory(historyResponse.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await AttendanceService.checkOut();

      setTodayAttendance(response.data);

      const historyResponse = await AttendanceService.getMyHistory();

      setMyHistory(historyResponse.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const hasCheckedIn = todayAttendance && todayAttendance.checkIn;
  const hasCheckedOut = todayAttendance && todayAttendance.checkOut;
  const todayStatus = formatStatus(todayAttendance?.status);

  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === String(selectedEmployeeId),
  );

  if (loading) {
    return (
      <div className="attendance-page">
        <div className="attendance-loading">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="attendance-page-header">
        <div>
          <div className="page-eyebrow">
            {isEmployee ? "SELF SERVICE" : "HR OPERATIONS"}
          </div>

          <h1 className="page-title">Attendance</h1>

          <p className="page-description">
            {isEmployee
              ? "Track your daily attendance, working hours, and attendance history."
              : "Monitor today's workforce attendance and employee activity."}
          </p>
        </div>

        <button
          type="button"
          className="attendance-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={refreshing ? "attendance-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && <div className="attendance-error">{error}</div>}

      {/* Employee View */}
      {isEmployee && (
        <>
          <section className="attendance-today-card">
            <div className="attendance-today-heading">
              <div>
                <div className="attendance-card-eyebrow">TODAY</div>

                <h2>
                  {formatDate(
                    todayAttendance?.attendanceDate ||
                      new Date().toISOString().slice(0, 10),
                  )}
                </h2>
              </div>

              <span
                className={`attendance-status-badge ${todayStatus.className}`}
              >
                <span className="attendance-status-dot" />
                {todayStatus.label}
              </span>
            </div>

            <div className="attendance-metrics">
              <div className="attendance-metric-card">
                <div className="attendance-metric-icon blue">
                  <LogIn size={18} />
                </div>

                <div>
                  <span>Check In</span>
                  <strong>{formatTime(todayAttendance?.checkIn)}</strong>
                </div>
              </div>

              <div className="attendance-metric-card">
                <div className="attendance-metric-icon orange">
                  <LogOut size={18} />
                </div>

                <div>
                  <span>Check Out</span>
                  <strong>{formatTime(todayAttendance?.checkOut)}</strong>
                </div>
              </div>

              <div className="attendance-metric-card">
                <div className="attendance-metric-icon green">
                  <Clock3 size={18} />
                </div>

                <div>
                  <span>Working Hours</span>
                  <strong>{formatHours(todayAttendance?.workingHours)}</strong>
                </div>
              </div>
            </div>

            <div className="attendance-actions">
              <button
                type="button"
                className="attendance-checkin-button"
                onClick={handleCheckIn}
                disabled={actionLoading || hasCheckedIn}
              >
                <LogIn size={16} />

                {actionLoading && !hasCheckedIn
                  ? "Processing..."
                  : hasCheckedIn
                    ? "Checked In"
                    : "Check In"}
              </button>

              <button
                type="button"
                className="attendance-checkout-button"
                onClick={handleCheckOut}
                disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
              >
                <LogOut size={16} />

                {hasCheckedOut ? "Checked Out" : "Check Out"}
              </button>
            </div>
          </section>

          <section className="attendance-section-card">
            <div className="attendance-section-header">
              <div>
                <h2>Attendance History</h2>
                <p>Your recorded attendance history.</p>
              </div>
            </div>

            {myHistory.length === 0 ? (
              <div className="attendance-empty">
                <CalendarDays size={28} />

                <h3>No attendance records</h3>

                <p>
                  Your attendance history will appear here after your first
                  check-in.
                </p>
              </div>
            ) : (
              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {myHistory.map((record) => {
                      const status = formatStatus(record.status);

                      return (
                        <tr key={record.id}>
                          <td>{formatDate(record.attendanceDate)}</td>

                          <td>{formatTime(record.checkIn)}</td>

                          <td>{formatTime(record.checkOut)}</td>

                          <td>{formatHours(record.workingHours)}</td>

                          <td>
                            <span
                              className={`attendance-status-badge ${status.className}`}
                            >
                              {status.label}
                            </span>
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

      {/* Admin / HR View */}
      {isAdminOrHr && (
        <>
          <div className="attendance-summary-grid">
            <div className="attendance-summary-card">
              <div className="attendance-summary-icon blue">
                <Users size={19} />
              </div>

              <div>
                <span>Total Employees</span>
                <strong>{dashboardStats.totalEmployees}</strong>
              </div>
            </div>

            <div className="attendance-summary-card">
              <div className="attendance-summary-icon green">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Present</span>
                <strong>{dashboardStats.present}</strong>
              </div>
            </div>

            <div className="attendance-summary-card">
              <div className="attendance-summary-icon orange">
                <Clock3 size={19} />
              </div>

              <div>
                <span>Late</span>
                <strong>{dashboardStats.late}</strong>
              </div>
            </div>

            <div className="attendance-summary-card">
              <div className="attendance-summary-icon purple">
                <CalendarDays size={19} />
              </div>

              <div>
                <span>Half Day</span>
                <strong>{dashboardStats.halfDay}</strong>
              </div>
            </div>

            <div className="attendance-summary-card attendance-summary-card-absent">
              <div className="attendance-summary-icon red">
                <Users size={19} />
              </div>

              <div>
                <span>Absent</span>
                <strong>{dashboardStats.absent}</strong>
              </div>
            </div>

            <div className="attendance-summary-card attendance-summary-card-rate">
              <div className="attendance-summary-icon teal">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span>Attendance Rate</span>
                <strong>
                  {Number(dashboardStats.attendancePercentage).toFixed(2)}%
                </strong>
              </div>
            </div>
          </div>

          {/* Today's Attendance */}
          <section className="attendance-section-card">
            <div className="attendance-section-header">
              <div>
                <h2>Today's Attendance</h2>
                <p>Attendance records currently registered for today.</p>
              </div>
            </div>

            {allTodayAttendance.length === 0 ? (
              <div className="attendance-empty">
                <Users size={28} />

                <h3>No attendance recorded yet</h3>

                <p>Employees will appear here after they check in.</p>
              </div>
            ) : (
              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Code</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allTodayAttendance.map((record) => {
                      const status = formatStatus(record.status);

                      return (
                        <tr key={record.id}>
                          <td>
                            <strong>{record.employeeName || "Employee"}</strong>
                          </td>

                          <td>{record.employeeCode || "—"}</td>

                          <td>{formatTime(record.checkIn)}</td>

                          <td>{formatTime(record.checkOut)}</td>

                          <td>{formatHours(record.workingHours)}</td>

                          <td>
                            <span
                              className={`attendance-status-badge ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Employee Attendance History */}
          <section className="attendance-section-card">
            <div className="attendance-section-header">
              <div>
                <h2>Employee Attendance History</h2>
                <p>
                  Review attendance records for any employee across previous
                  dates.
                </p>
              </div>

              <div>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  disabled={employeeHistoryLoading || employees.length === 0}
                  style={{
                    minWidth: "240px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {employees.length === 0 ? (
                    <option value="">No employees found</option>
                  ) : (
                    employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} —{" "}
                        {employee.employeeCode}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {employeeHistoryLoading ? (
              <div className="attendance-loading">
                Loading employee attendance...
              </div>
            ) : employeeHistory.length === 0 ? (
              <div className="attendance-empty">
                <CalendarDays size={28} />

                <h3>No attendance records</h3>

                <p>
                  {selectedEmployee
                    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} has no attendance history.`
                    : "Select an employee to view attendance history."}
                </p>
              </div>
            ) : (
              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee</th>
                      <th>Code</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employeeHistory.map((record) => {
                      const status = formatStatus(record.status);

                      return (
                        <tr key={record.id}>
                          <td>{formatDate(record.attendanceDate)}</td>

                          <td>
                            <strong>{record.employeeName || "Employee"}</strong>
                          </td>

                          <td>{record.employeeCode || "—"}</td>

                          <td>{formatTime(record.checkIn)}</td>

                          <td>{formatTime(record.checkOut)}</td>

                          <td>{formatHours(record.workingHours)}</td>

                          <td>
                            <span
                              className={`attendance-status-badge ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td>{record.remarks || "—"}</td>
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
    </div>
  );
}
