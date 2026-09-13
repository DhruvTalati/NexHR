import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";

import EmployeeForm from "../components/EmployeeForm";
import EmployeeService from "../services/EmployeeService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    EmployeeService.getEmployeeById(id)
      .then((res) => {
        const employee = res.data;

        setInitialValues({
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          email: employee.email || "",
          phone: employee.phone || "",
          dateOfBirth: employee.dateOfBirth || "",
          dateOfJoining: employee.dateOfJoining || "",
          department: employee.department || "IT",
          designation: employee.designation || "",
          salary: employee.salary != null ? String(employee.salary) : "",
          employmentType: employee.employmentType || "FULL_TIME",
          status: employee.status || "ACTIVE",
          address: employee.address || "",
          city: employee.city || "",
          country: employee.country || "",
        });
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (values) => {
    setError("");

    try {
      await EmployeeService.updateEmployee(id, values);

      navigate(`/employees/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));

      throw err;
    }
  };

  if (loading) {
    return (
      <div className="profile-state">
        <LoadingSpinner label="Loading employee..." />
      </div>
    );
  }

  return (
    <div className="employee-create-page">
      {/* Header */}

      <div className="employee-create-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(`/employees/${id}`)}
        >
          <ArrowLeft size={16} />
          Back to Employee
        </button>

        <div className="employee-create-heading">
          <div className="create-heading-icon">
            <Pencil size={20} />
          </div>

          <div>
            <div className="page-eyebrow">WORKFORCE MANAGEMENT</div>

            <h1 className="page-title">Edit Employee</h1>

            <p className="page-description">
              Update employee information, employment details, and location.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="employee-form-error">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Form */}

      {initialValues && (
        <div className="employee-form-card">
          <EmployeeForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            onCancel={() => navigate(`/employees/${id}`)}
          />
        </div>
      )}
    </div>
  );
}
