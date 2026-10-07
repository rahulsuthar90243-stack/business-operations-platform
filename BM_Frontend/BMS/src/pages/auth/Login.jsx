import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { useAuth } from "../../context/AuthContext";

const REDIRECT_AFTER_LOGIN = "/"; // change to your dashboard route
const REDIRECT_DELAY_MS = 800;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errs = {};
  const email = form.email.trim();

  if (!email) {
    errs.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errs.email = "Enter a valid email address";
  }

  if (!form.password) {
    errs.password = "Password is required";
  }

  return errs;
}

function statusToMessage(status, serverMessage) {
  if (serverMessage) return serverMessage;
  switch (status) {
    case 400:
      return "Please check your email and password and try again.";
    case 401:
      return "Incorrect email or password.";
    case 403:
      return "Your account doesn't have access. Contact support.";
    case 429:
      return "Too many attempts. Wait a minute and try again.";
    default:
      return status >= 500
        ? "Something went wrong on our side. Try again shortly."
        : "Login failed. Try again.";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const abortRef = useRef(null);
  const redirectTimer = useRef(undefined);

  // Cancel in-flight request and pending redirect on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      window.clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear stale feedback as soon as the user edits
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setServerError("");
    setSuccessMessage("");

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Move focus to the first invalid field
      const firstInvalid = validationErrors.email ? "email" : "password";
      const el = document.getElementById(firstInvalid);
      if (el) el.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await login(form, { signal: controller.signal });

      setSuccessMessage("Login successful! Redirecting…");
      setForm({ email: "", password: "" });

      redirectTimer.current = window.setTimeout(() => {
        navigate(REDIRECT_AFTER_LOGIN, { replace: true });
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      if (err && err.name === "AbortError") return;

      if (err instanceof TypeError) {
        // fetch throws TypeError on network failure / CORS block
        setServerError(
          "Can't reach the server. Check your connection and try again."
        );
      } else if (err instanceof Error) {
        setServerError(
          err.status
            ? statusToMessage(err.status, err.message)
            : err.message
        );
      } else {
        setServerError("Login failed. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500 ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">Log in</h2>

        {successMessage && (
          <div
            role="status"
            className="p-3 mb-4 text-green-600 bg-green-100 rounded"
          >
            {successMessage}
          </div>
        )}
        {serverError && (
          <div role="alert" className="p-3 mb-4 text-red-600 bg-red-100 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={handleChange("email")}
              className={inputClass(!!errors.email)}
              disabled={submitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange("password")}
                className={`${inputClass(!!errors.password)} pr-16`}
                disabled={submitting}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                disabled={submitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 px-3 text-sm text-violet-600 disabled:opacity-50"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !!successMessage}
            className="w-full py-2 rounded bg-violet-600 text-white font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 0 1 9.95 8.129l-1.84.454a8 8 0 1 0-16.29 0l-1.84-.454A10 10 0 0 1 12 2z"
                  />
                </svg>
                <span>Logging in…</span>
              </span>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-violet-600">
            Register
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}