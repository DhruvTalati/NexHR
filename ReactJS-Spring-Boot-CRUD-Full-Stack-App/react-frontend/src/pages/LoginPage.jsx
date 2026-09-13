import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../api/axiosClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(email, password);

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}

      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-brand-logo">N</div>

          <div>
            <div className="auth-brand-name">NexHR</div>

            <div className="auth-brand-subtitle">HR OPERATIONS</div>
          </div>
        </div>

        <div className="auth-brand-content">
          <div className="auth-brand-eyebrow">MODERN WORKFORCE MANAGEMENT</div>

          <h1>
            Manage your workforce
            <span>with confidence.</span>
          </h1>

          <p>
            A centralized HR platform for employee management, organization
            insights, and secure workforce operations.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <Users size={17} />
              </div>

              <div>
                <strong>Employee Management</strong>

                <span>Manage your complete workforce from one place.</span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <BarChart3 size={17} />
              </div>

              <div>
                <strong>HR Analytics</strong>

                <span>
                  Monitor workforce trends and organizational insights.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>Secure Access</strong>

                <span>Role-based authentication with protected resources.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          © {new Date().getFullYear()} NexHR Workforce Management
        </div>
      </section>

      {/* Login panel */}

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <div className="auth-brand-logo">N</div>

            <div>
              <div className="auth-brand-name">NexHR</div>

              <div className="auth-brand-subtitle">HR OPERATIONS</div>
            </div>
          </div>

          <div className="auth-form-heading">
            <div className="auth-form-eyebrow">WELCOME BACK</div>

            <h2>Sign in to your account</h2>

            <p>Enter your credentials to access your HR workspace.</p>
          </div>

          {error && (
            <div className="auth-error">
              <ErrorMessage message={error} />
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>

              <div className="auth-input-wrapper">
                <Mail size={17} />

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>

              <div className="auth-input-wrapper">
                <Lock size={17} />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting}
            >
              <span>{submitting ? "Signing in..." : "Sign In"}</span>

              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to NexHR?</span>
          </div>

          <Link to="/register" className="auth-register-link">
            Create an account
          </Link>

          <div className="auth-demo-box">
            <strong>Local Demo Account</strong>

            <span>admin@ems.local</span>

            <span>Admin@12345</span>
          </div>
        </div>
      </section>
    </div>
  );
}
