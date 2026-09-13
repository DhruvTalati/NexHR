import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const registeredUser = await register(name, email, password);

      navigate(
        registeredUser.role === "ADMIN" || registeredUser.role === "HR"
          ? "/dashboard"
          : "/profile",
        {
          replace: true,
        },
      );
      
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const hasMinLength = password.length >= 8;

  return (
    <div className="auth-page">
      {/* =================================================
                LEFT BRANDING PANEL
            ================================================== */}

      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-brand-logo">N</div>

          <div>
            <div className="auth-brand-name">NexHR</div>

            <div className="auth-brand-subtitle">HR OPERATIONS</div>
          </div>
        </div>

        <div className="auth-brand-content">
          <div className="auth-brand-eyebrow">JOIN THE WORKSPACE</div>

          <h1>
            Build a better
            <span>workforce together.</span>
          </h1>

          <p>
            Create your NexHR account and access a centralized platform for
            employee and workforce management.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <Users size={17} />
              </div>

              <div>
                <strong>Employee-first workspace</strong>

                <span>
                  Keep workforce information organized and accessible.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>Secure access</strong>

                <span>
                  Every account starts with standard employee permissions.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <strong>Simple onboarding</strong>

                <span>Create your account in a few simple steps.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          © {new Date().getFullYear()} NexHR Workforce Management
        </div>
      </section>

      {/* =================================================
                REGISTER PANEL
            ================================================== */}

      <section className="auth-form-panel">
        <div className="auth-form-container">
          {/* Mobile brand */}

          <div className="auth-mobile-brand">
            <div className="auth-brand-logo">N</div>

            <div>
              <div className="auth-brand-name">NexHR</div>

              <div className="auth-brand-subtitle">HR OPERATIONS</div>
            </div>
          </div>

          {/* Heading */}

          <div className="auth-form-heading">
            <div className="auth-form-eyebrow">GET STARTED</div>

            <h2>Create your account</h2>

            <p>
              Register for access to the NexHR workforce management platform.
            </p>
          </div>

          {/* Existing error component */}

          {error && (
            <div className="auth-error">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Form */}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Name */}

            <div className="auth-field">
              <label htmlFor="register-name">Full Name</label>

              <div className="auth-input-wrapper">
                <User size={17} />

                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Email */}

            <div className="auth-field">
              <label htmlFor="register-email">Email Address</label>

              <div className="auth-input-wrapper">
                <Mail size={17} />

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>

              <div className="auth-input-wrapper">
                <Lock size={17} />

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="password-requirement">
                <span className={hasMinLength ? "requirement-met" : ""}>
                  <CheckCircle2 size={12} />
                  At least 8 characters
                </span>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting || !hasMinLength}
            >
              <span>
                {submitting ? "Creating account..." : "Create Account"}
              </span>

              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Login */}

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="auth-register-link">
            Sign in instead
          </Link>

          {/* Permission note */}

          <div className="auth-demo-box">
            <strong>Account permissions</strong>

            <span>New accounts are created with standard Employee access.</span>

            <span>
              An administrator can grant HR or Admin access afterward.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
