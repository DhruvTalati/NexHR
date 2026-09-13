import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Users,
  UserPlus,
} from "lucide-react";

import EmployeeService from "../services/EmployeeService";
import EmployeeTable from "../components/EmployeeTable";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

const DEPARTMENTS = [
  "",
  "IT",
  "HR",
  "FINANCE",
  "MARKETING",
  "SALES",
  "OPERATIONS",
];

const STATUSES = ["", "ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"];

export default function EmployeesListPage() {
  const navigate = useNavigate();

  const [pageData, setPageData] = useState({
    content: [],
    page: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState("ASC");

  const [page, setPage] = useState(0);

  const [pendingDelete, setPendingDelete] = useState(null);

  const loadEmployees = useCallback(() => {
    setLoading(true);
    setError("");

    let request;

    if (keyword) {
      request = EmployeeService.searchEmployees(keyword, {
        page,
        size: 10,
      });
    } else if (departmentFilter || statusFilter) {
      request = EmployeeService.filterEmployees(
        {
          department: departmentFilter || undefined,

          status: statusFilter || undefined,
        },
        {
          page,
          size: 10,
        },
      );
    } else {
      request = EmployeeService.getEmployees({
        page,
        size: 10,
        sortBy,
        sortDirection,
      });
    }

    request
      .then((res) => {
        setPageData(res.data);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [keyword, departmentFilter, statusFilter, sortBy, sortDirection, page]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSearch = (event) => {
    const value = event.target.value;

    setKeyword(value);
    setDepartmentFilter("");
    setStatusFilter("");
    setPage(0);
  };

  const handleDepartmentChange = (event) => {
    setDepartmentFilter(event.target.value);
    setKeyword("");
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setKeyword("");
    setPage(0);
  };

  const handleSort = (column) => {
    if (keyword || departmentFilter || statusFilter) {
      return;
    }

    if (sortBy === column) {
      setSortDirection((previous) => (previous === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortDirection("ASC");
    }

    setPage(0);
  };

  const clearFilters = () => {
    setKeyword("");
    setDepartmentFilter("");
    setStatusFilter("");
    setSortBy("id");
    setSortDirection("ASC");
    setPage(0);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await EmployeeService.deleteEmployee(pendingDelete.id);

      setToast({
        type: "success",
        message: `${pendingDelete.firstName} ${pendingDelete.lastName} was deleted successfully.`,
      });

      setPendingDelete(null);

      loadEmployees();
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err),
      });

      setPendingDelete(null);
    }
  };

  const hasFilters = keyword || departmentFilter || statusFilter;

  return (
    <div className="employees-page">
      {/* Page Header */}

      <div className="employees-page-header">
        <div>
          <div className="page-eyebrow">WORKFORCE MANAGEMENT</div>

          <h1 className="page-title">Employees</h1>

          <p className="page-description">
            Manage employees, roles, departments, and workforce status.
          </p>
        </div>

        <button
          type="button"
          className="employees-add-button"
          onClick={() => navigate("/employees/new")}
        >
          <Plus size={17} />
          Add Employee
        </button>
      </div>

      {/* Summary */}

      <div className="employees-summary">
        <div className="employees-summary-item">
          <div className="employees-summary-icon">
            <Users size={18} />
          </div>

          <div>
            <div className="employees-summary-label">Total Employees</div>

            <div className="employees-summary-value">
              {pageData.totalElements ?? pageData.content.length}
            </div>
          </div>
        </div>

        <div className="employees-summary-item">
          <div className="employees-summary-icon blue">
            <UserPlus size={18} />
          </div>

          <div>
            <div className="employees-summary-label">Current Page</div>

            <div className="employees-summary-value">
              {pageData.content.length}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}

      <div className="employees-toolbar">
        <div className="employees-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={keyword}
            onChange={handleSearch}
          />
        </div>

        <div className="employees-filters">
          <div className="employees-filter">
            <SlidersHorizontal size={14} />

            <select value={departmentFilter} onChange={handleDepartmentChange}>
              <option value="">All Departments</option>

              {DEPARTMENTS.filter(Boolean).map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="employees-filter">
            <select value={statusFilter} onChange={handleStatusChange}>
              <option value="">All Statuses</option>

              {STATUSES.filter(Boolean).map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Sort information */}

      {!keyword && !departmentFilter && !statusFilter && (
        <div className="employees-sort-info">
          <ArrowUpDown size={13} />

          <span>Click a column header to sort employees</span>

          <span className="sort-state">
            {sortBy} · {sortDirection}
          </span>
        </div>
      )}

      {/* Main Table */}

      <div className="employees-table-card">
        {loading ? (
          <div className="employees-state">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="employees-state">
            <ErrorMessage message={error} onRetry={loadEmployees} />
          </div>
        ) : pageData.content.length === 0 ? (
          <div className="employees-empty">
            <div className="employees-empty-icon">
              <Users size={28} />
            </div>

            <h3>No employees found</h3>

            <p>Try adjusting your filters or search for another employee.</p>

            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={pageData.content}
              onDelete={setPendingDelete}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            <div className="employees-pagination">
              <Pagination
                page={pageData.page}
                totalPages={pageData.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation */}

      <Modal
        show={!!pendingDelete}
        title="Delete Employee"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        confirmLabel="Delete Employee"
      >
        {pendingDelete && (
          <div className="delete-confirmation">
            <div className="delete-warning-icon">⚠</div>

            <div>
              <p>
                Are you sure you want to delete
                <strong>
                  {" "}
                  {pendingDelete.firstName} {pendingDelete.lastName}
                </strong>
                ?
              </p>

              <small>This action cannot be undone.</small>
            </div>
          </div>
        )}
      </Modal>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
