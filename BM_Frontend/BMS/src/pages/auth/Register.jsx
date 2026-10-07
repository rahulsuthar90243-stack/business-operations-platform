import { useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email format";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setServerError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await register({
        username: form.name.trim(),
        email: form.email,
        password: form.password,
      });
      setSuccessMessage("Registration successful! You can now log in.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create an Account</h2>
        {successMessage && (
          <div className="p-3 mb-4 text-green-600 bg-green-100 rounded">
            {successMessage}
          </div>
        )}
        {serverError && (
          <div className="p-3 mb-4 text-red-600 bg-red-100 rounded">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full p-2 border rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
              disabled={submitting}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full p-2 border rounded ${errors.email ? "border-red-500" : "border-gray-300"}`}
              disabled={submitting}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full p-2 border rounded ${errors.password ? "border-red-500" : "border-gray-300"}`}
              disabled={submitting}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={`w-full p-2 border rounded ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
              disabled={submitting}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded bg-violet-600 text-white font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2a10 10 0 0 1 9.95 8.129l-1.84.454a8 8 0 1 0-16.29 0l-1.84-.454A10 10 0 0 1 12 2z" />
                </svg>
                <span>Registering…</span>
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-violet-600">Log in</Link>
        </div>
      </div>
    </PageWrapper>
  );
}
