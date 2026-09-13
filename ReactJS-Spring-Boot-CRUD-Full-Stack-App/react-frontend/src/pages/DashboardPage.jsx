import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  Users,
  UserCheck,
  CalendarDays,
  Building2,
  UserX,
  Wallet,
  Plus,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardService from "../services/DashboardService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([
      DashboardService.getStats(),
      DashboardService.getDepartmentSummary(),
    ])
      .then(([statsRes, summaryRes]) => {
        setStats(statsRes.data);

        setDepartmentSummary(
          summaryRes.data.map((row) => ({
            department: row.department,
            count: row.employeeCount,
          })),
        );
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const workforceData = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        name: "Active",
        value: Number(stats.activeEmployees) || 0,
      },
      {
        name: "On Leave",
        value: Number(stats.employeesOnLeave) || 0,
      },
      {
        name: "Inactive",
        value: Number(stats.inactiveEmployees) || 0,
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">OVERVIEW</div>

          <h1 className="dashboard-title">Dashboard</h1>

          <p className="dashboard-description">
            Monitor your organization's workforce and HR operations.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-add-button"
          onClick={() => navigate("/employees/new")}
        >
          <Plus size={17} />
          Add Employee
        </button>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">TOTAL EMPLOYEES</div>

              <div className="stat-value">{stats.totalEmployees}</div>
            </div>

            <div className="stat-icon stat-icon-blue">
              <Users size={20} />
            </div>
          </div>

          <div className="stat-bottom">
            <span className="stat-positive">
              <ArrowUpRight size={13} />
              Workforce
            </span>

            <span>Current total</span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">ACTIVE EMPLOYEES</div>

              <div className="stat-value">{stats.activeEmployees}</div>
            </div>

            <div className="stat-icon stat-icon-green">
              <UserCheck size={20} />
            </div>
          </div>

          <div className="stat-bottom">
            <span className="stat-positive">
              <Activity size={13} />
              Active
            </span>

            <span>Currently working</span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">ON LEAVE</div>

              <div className="stat-value">{stats.employeesOnLeave}</div>
            </div>

            <div className="stat-icon stat-icon-orange">
              <CalendarDays size={20} />
            </div>
          </div>

          <div className="stat-bottom">
            <span className="stat-warning">Leave status</span>

            <span>Currently away</span>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-top">
            <div>
              <div className="stat-label">DEPARTMENTS</div>

              <div className="stat-value">{stats.departmentCount}</div>
            </div>

            <div className="stat-icon stat-icon-purple">
              <Building2 size={20} />
            </div>
          </div>

          <div className="stat-bottom">
            <span className="stat-positive">
              <Building2 size={13} />
              Organization
            </span>

            <span>Departments</span>
          </div>
        </div>
      </div>

      {/* Secondary statistics */}
      <div className="dashboard-secondary-stats">
        <div className="mini-stat-card">
          <div className="mini-stat-icon">
            <UserX size={18} />
          </div>

          <div>
            <div className="mini-stat-label">Inactive Employees</div>

            <div className="mini-stat-value">{stats.inactiveEmployees}</div>
          </div>
        </div>

        <div className="mini-stat-card">
          <div className="mini-stat-icon">
            <Wallet size={18} />
          </div>

          <div>
            <div className="mini-stat-label">Average Salary</div>

            <div className="mini-stat-value">
              ₹{Number(stats.averageSalary || 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="mini-stat-card">
          <div className="mini-stat-icon">
            <Users size={18} />
          </div>

          <div>
            <div className="mini-stat-label">Workforce Utilization</div>

            <div className="mini-stat-value">
              {stats.totalEmployees > 0
                ? Math.round(
                    (stats.activeEmployees / stats.totalEmployees) * 100,
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <section className="dashboard-panel department-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Employees by Department</h2>

              <p className="panel-description">
                Distribution of employees across departments
              </p>
            </div>
          </div>

          {departmentSummary.length === 0 ? (
            <div className="dashboard-empty">
              <Building2 size={30} />
              <span>No department data available</span>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentSummary}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="department"
                    tick={{
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(37, 99, 235, 0.05)",
                    }}
                  />

                  <Bar
                    dataKey="count"
                    radius={[7, 7, 0, 0]}
                    fill="#2563eb"
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="dashboard-panel workforce-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Workforce Overview</h2>

              <p className="panel-description">
                Current employee status distribution
              </p>
            </div>
          </div>

          {workforceData.length === 0 ? (
            <div className="dashboard-empty">
              <Users size={30} />
              <span>No workforce data available</span>
            </div>
          ) : (
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workforceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {workforceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#2563eb", "#f59e0b", "#94a3b8"][index % 3]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-center-label">
                <strong>{stats.totalEmployees}</strong>

                <span>Total</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Bottom panel */}
      <section className="dashboard-panel workforce-summary">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Workforce Snapshot</h2>

            <p className="panel-description">
              Quick overview of your current workforce
            </p>
          </div>
        </div>

        <div className="snapshot-grid">
          <div className="snapshot-item">
            <span>Total Employees</span>
            <strong>{stats.totalEmployees}</strong>
          </div>

          <div className="snapshot-item">
            <span>Active</span>
            <strong>{stats.activeEmployees}</strong>
          </div>

          <div className="snapshot-item">
            <span>On Leave</span>
            <strong>{stats.employeesOnLeave}</strong>
          </div>

          <div className="snapshot-item">
            <span>Inactive</span>
            <strong>{stats.inactiveEmployees}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
