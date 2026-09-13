import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Building2, Plus, Pencil, Trash2, Users, X, Save } from "lucide-react";

import DepartmentService from "../services/DepartmentService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { getErrorMessage } from "../api/axiosClient";

const EMPTY_FORM = {
  name: "",
  description: "",
};

export default function DepartmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    DepartmentService.getDepartments()
      .then((res) => setDepartments(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (department) => {
    setForm({
      name: department.name,
      description: department.description || "",
    });

    setEditingId(department.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await DepartmentService.updateDepartment(editingId, form);

        setToast({
          type: "success",
          message: "Department updated successfully.",
        });
      } else {
        await DepartmentService.createDepartment(form);

        setToast({
          type: "success",
          message: "Department created successfully.",
        });
      }

      closeForm();
      load();
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err),
      });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      await DepartmentService.deleteDepartment(pendingDelete.id);

      setToast({
        type: "success",
        message: `'${pendingDelete.name}' deleted successfully.`,
      });

      setPendingDelete(null);
      load();
    } catch (err) {
      setToast({
        type: "error",
        message: getErrorMessage(err),
      });

      setPendingDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="departments-state">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="departments-page">
      {/* Header */}

      <div className="departments-header">
        <div>
          <div className="page-eyebrow">ORGANIZATION</div>

          <h1 className="page-title">Departments</h1>

          <p className="page-description">
            Organize teams and manage your company's workforce structure.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="department-add-button"
            onClick={openCreateForm}
          >
            <Plus size={17} />
            Add Department
          </button>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="departments-error">
          <ErrorMessage message={error} onRetry={load} />
        </div>
      )}

      {/* Summary */}

      <div className="department-summary">
        <div className="department-summary-card">
          <div className="department-summary-icon blue">
            <Building2 size={20} />
          </div>

          <div>
            <div className="department-summary-label">Total Departments</div>

            <div className="department-summary-value">{departments.length}</div>
          </div>
        </div>

        <div className="department-summary-card">
          <div className="department-summary-icon green">
            <Users size={20} />
          </div>

          <div>
            <div className="department-summary-label">
              Organization Structure
            </div>

            <div className="department-summary-value">
              {departments.length > 0 ? "Active" : "Empty"}
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit form */}

      {showForm && (
        <div className="department-form-card">
          <div className="department-form-header">
            <div className="department-form-heading">
              <div className="department-form-icon">
                {editingId ? <Pencil size={18} /> : <Plus size={18} />}
              </div>

              <div>
                <h2>{editingId ? "Edit Department" : "Create Department"}</h2>

                <p>
                  {editingId
                    ? "Update department information."
                    : "Add a new department to your organization."}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="department-close-button"
              onClick={closeForm}
            >
              <X size={17} />
            </button>
          </div>

          <form className="department-form" onSubmit={handleFormSubmit}>
            <div className="department-form-fields">
              <div className="department-form-field">
                <label htmlFor="departmentName">
                  Department Name
                  <span>*</span>
                </label>

                <input
                  id="departmentName"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((previous) => ({
                      ...previous,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Engineering"
                  required
                />
              </div>

              <div className="department-form-field department-form-description">
                <label htmlFor="departmentDescription">Description</label>

                <textarea
                  id="departmentDescription"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm((previous) => ({
                      ...previous,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the department's responsibilities..."
                />
              </div>
            </div>

            <div className="department-form-actions">
              <button
                type="button"
                className="form-cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button type="submit" className="form-submit-button">
                <Save size={15} />

                {editingId ? "Save Changes" : "Create Department"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Department cards */}

      {departments.length === 0 ? (
        <div className="departments-empty">
          <div className="departments-empty-icon">
            <Building2 size={30} />
          </div>

          <h3>No departments yet</h3>

          <p>
            Create your first department to start organizing your workforce.
          </p>

          {isAdmin && (
            <button
              type="button"
              className="secondary-button"
              onClick={openCreateForm}
            >
              <Plus size={15} />
              Create Department
            </button>
          )}
        </div>
      ) : (
        <div className="department-grid">
          {departments.map((department) => (
            <div className="department-card-new" key={department.id}>
              <div className="department-card-top">
                <div className="department-card-icon">
                  <Building2 size={20} />
                </div>

                {isAdmin && (
                  <div className="department-card-actions">
                    <button
                      type="button"
                      title="Edit department"
                      className="department-icon-action edit"
                      onClick={() => openEditForm(department)}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      title="Delete department"
                      className="department-icon-action delete"
                      onClick={() => setPendingDelete(department)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="department-card-name">{department.name}</div>

              <div className="department-card-description">
                {department.description ||
                  "No description provided for this department."}
              </div>

              <div className="department-card-footer">
                <div className="department-member-info">
                  <Users size={14} />

                  <span>Department</span>
                </div>

                <span className="department-active-badge">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}

      <Modal
        show={!!pendingDelete}
        title="Delete Department"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        confirmLabel="Delete Department"
      >
        {pendingDelete && (
          <div className="department-delete-content">
            <div className="delete-warning-icon">⚠</div>

            <div>
              <p>
                Delete department
                <strong> {pendingDelete.name}</strong>?
              </p>

              <small>
                This action is blocked when employees are still assigned to this
                department.
              </small>
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
