import React, { useState } from "react";

const DEPARTMENTS = ["IT", "HR", "FINANCE", "MARKETING", "SALES", "OPERATIONS"];

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"];

const STATUSES = ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  dateOfJoining: "",
  department: "IT",
  designation: "",
  salary: "",
  employmentType: "FULL_TIME",
  status: "ACTIVE",
  address: "",
  city: "",
  country: "",
};

export default function EmployeeForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  onCancel,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...initialValues,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        salary: form.salary === "" ? null : Number(form.salary),
      });
    } catch (err) {
      // Parent page owns error handling.
    } finally {
      setSubmitting(false);
    }
  };

  const formatLabel = (value) => {
    return value
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      {/* =========================================
                PERSONAL INFORMATION
            ========================================== */}

      <section className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">01</div>

          <div>
            <h3>Personal Information</h3>

            <p>Basic information about the employee.</p>
          </div>
        </div>

        <div className="employee-form-grid">
          <div className="employee-form-field">
            <label htmlFor="firstName">
              First Name
              <span>*</span>
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="lastName">
              Last Name
              <span>*</span>
            </label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="email">
              Email Address
              <span>*</span>
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="phone">Phone Number</label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="dateOfBirth">
              Date of Birth
              <span>*</span>
            </label>

            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="dateOfJoining">
              Date of Joining
              <span>*</span>
            </label>

            <input
              id="dateOfJoining"
              name="dateOfJoining"
              type="date"
              value={form.dateOfJoining}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </section>

      {/* =========================================
                EMPLOYMENT DETAILS
            ========================================== */}

      <section className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">02</div>

          <div>
            <h3>Employment Details</h3>

            <p>Job role, department and employment status.</p>
          </div>
        </div>

        <div className="employee-form-grid employment-grid">
          <div className="employee-form-field">
            <label htmlFor="department">Department</label>

            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="employee-form-field">
            <label htmlFor="designation">
              Designation
              <span>*</span>
            </label>

            <input
              id="designation"
              name="designation"
              type="text"
              value={form.designation}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="salary">
              Annual Salary
              <span>*</span>
            </label>

            <div className="salary-input">
              <span>₹</span>

              <input
                id="salary"
                name="salary"
                type="number"
                step="0.01"
                min="0"
                value={form.salary}
                onChange={handleChange}
                placeholder="75000"
                required
              />
            </div>
          </div>

          <div className="employee-form-field">
            <label htmlFor="employmentType">Employment Type</label>

            <select
              id="employmentType"
              name="employmentType"
              value={form.employmentType}
              onChange={handleChange}
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="employee-form-field">
            <label htmlFor="status">Employment Status</label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* =========================================
                LOCATION
            ========================================== */}

      <section className="form-section">
        <div className="form-section-header">
          <div className="form-section-icon">03</div>

          <div>
            <h3>Location Information</h3>

            <p>Employee address and location details.</p>
          </div>
        </div>

        <div className="employee-form-grid">
          <div className="employee-form-field full">
            <label htmlFor="address">Address</label>

            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              rows="3"
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="city">City</label>

            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Vadodara"
            />
          </div>

          <div className="employee-form-field">
            <label htmlFor="country">Country</label>

            <input
              id="country"
              name="country"
              type="text"
              value={form.country}
              onChange={handleChange}
              placeholder="e.g. India"
            />
          </div>
        </div>
      </section>

      {/* =========================================
                ACTIONS
            ========================================== */}

      <div className="employee-form-actions">
        <div className="required-note">
          <span>*</span>
          Required fields
        </div>

        <div className="employee-form-buttons">
          {onCancel && (
            <button
              type="button"
              className="form-cancel-button"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="form-submit-button"
            disabled={submitting}
          >
            {submitting
              ? "Saving Employee..."
              : submitLabel === "Create"
                ? "Create Employee"
                : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
