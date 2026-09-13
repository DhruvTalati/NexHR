import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown, User } from "lucide-react";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    className: "employee-status-active",
  },
  INACTIVE: {
    label: "Inactive",
    className: "employee-status-inactive",
  },
  ON_LEAVE: {
    label: "On Leave",
    className: "employee-status-leave",
  },
  TERMINATED: {
    label: "Terminated",
    className: "employee-status-terminated",
  },
};

export default function EmployeeTable({
  employees,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
}) {
  const navigate = useNavigate();

  const renderSortIndicator = (column) => {
    if (sortBy !== column) {
      return null;
    }

    return sortDirection === "ASC" ? (
      <ArrowUp size={13} />
    ) : (
      <ArrowDown size={13} />
    );
  };

  const headerClick = (column) => () => {
    onSort(column);
  };

  const getInitials = (employee) => {
    const first = employee.firstName?.charAt(0)?.toUpperCase() || "";

    const last = employee.lastName?.charAt(0)?.toUpperCase() || "";

    return `${first}${last}` || "U";
  };

  const getStatusConfig = (status) => {
    return (
      STATUS_CONFIG[status] || {
        label: status || "Unknown",
        className: "employee-status-default",
      }
    );
  };

  return (
    <div className="employee-table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th
              className="sortable-column"
              onClick={headerClick("employeeCode")}
            >
              <div className="table-header-content">
                <span>Employee</span>
                {renderSortIndicator("employeeCode")}
              </div>
            </th>

            <th className="sortable-column" onClick={headerClick("firstName")}>
              <div className="table-header-content">
                <span>Name</span>
                {renderSortIndicator("firstName")}
              </div>
            </th>

            <th>Email</th>

            <th>Department</th>

            <th>Designation</th>

            <th>Status</th>

            <th className="actions-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.length === 0 && (
            <tr>
              <td colSpan="7" className="employee-table-empty">
                <div className="employee-table-empty-content">
                  <div className="employee-table-empty-icon">
                    <User size={24} />
                  </div>

                  <strong>No employees found</strong>

                  <span>Try adjusting your search or filters.</span>
                </div>
              </td>
            </tr>
          )}

          {employees.map((employee) => {
            const statusConfig = getStatusConfig(employee.status);

            return (
              <tr key={employee.id}>
                {/* Employee code + avatar */}

                <td>
                  <div className="employee-identity">
                    <div className="employee-avatar">
                      {getInitials(employee)}
                    </div>

                    <div className="employee-code-block">
                      <div className="employee-code">
                        {employee.employeeCode || "—"}
                      </div>

                      <div className="employee-id">ID #{employee.id}</div>
                    </div>
                  </div>
                </td>

                {/* Name */}

                <td>
                  <div className="employee-name-cell">
                    <span className="employee-full-name">
                      {employee.firstName} {employee.lastName}
                    </span>
                  </div>
                </td>

                {/* Email */}

                <td>
                  <span className="employee-email-cell">
                    {employee.email || "—"}
                  </span>
                </td>

                {/* Department */}

                <td>
                  <span className="employee-department">
                    {employee.department || "—"}
                  </span>
                </td>

                {/* Designation */}

                <td>
                  <span className="employee-designation">
                    {employee.designation || "—"}
                  </span>
                </td>

                {/* Status */}

                <td>
                  <span
                    className={`employee-status-badge ${statusConfig.className}`}
                  >
                    <span className="status-dot" />
                    {statusConfig.label}
                  </span>
                </td>

                {/* Actions */}

                <td>
                  <div className="employee-actions">
                    <button
                      type="button"
                      className="employee-action view"
                      title="View employee"
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      className="employee-action edit"
                      title="Edit employee"
                      onClick={() => navigate(`/employees/${employee.id}/edit`)}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      className="employee-action delete"
                      title="Delete employee"
                      onClick={() => onDelete(employee)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
