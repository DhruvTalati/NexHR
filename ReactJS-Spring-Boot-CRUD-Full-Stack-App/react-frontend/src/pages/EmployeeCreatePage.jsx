import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";

import EmployeeForm from "../components/EmployeeForm";
import EmployeeService from "../services/EmployeeService";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

export default function EmployeeCreatePage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const handleSubmit = async (values) => {
    setError("");

    try {
      await EmployeeService.createEmployee(values);

      navigate("/employees");
    } catch (err) {
      setError(getErrorMessage(err));

      throw err;
    }
  };

  return (
    <div className="employee-create-page">
      {/* Header */}

      <div className="employee-create-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/employees")}
        >
          <ArrowLeft size={16} />
          Back to Employees
        </button>

        <div className="employee-create-heading">
          <div className="create-heading-icon">
            <UserPlus size={21} />
          </div>

          <div>
            <div className="page-eyebrow">WORKFORCE MANAGEMENT</div>

            <h1 className="page-title">Add New Employee</h1>

            <p className="page-description">
              Create a new employee profile and assign their employment details.
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

      <div className="employee-form-card">
        <EmployeeForm
          onSubmit={handleSubmit}
          submitLabel="Create"
          onCancel={() => navigate("/employees")}
        />
      </div>
    </div>
  );
}
