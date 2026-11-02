//User registration page
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function UserRegister() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    workspaceCode: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.workspaceCode.trim()) {
    newErrors.workspaceCode = "Workspace code is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setServerError("");
    setSuccess("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        workspaceCode: form.workspaceCode.trim(),
        password: form.password,
      });

      setSuccess("Registration successful! You can now log in.");

      setForm({
        username: "",
        email: "",
        password: "",
        workspaceCode: "",
        confirmPassword: "",
      });

      setErrors({});
    } catch (err) {
      setServerError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-1 ${
      errors[field]
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-violet-500 focus:ring-violet-500"
    }`;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">User Registration</h2>

        <p className="mt-1 text-sm text-gray-500">
          Create your account to get started.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Full Name
          </label>

          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className={inputClass("username")}
            placeholder="Enter your name"
            disabled={loading}
          />

          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="user-email"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </label>

          <input
            id="user-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass("email")}
            placeholder="you@example.com"
            disabled={loading}
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="workspaceCode"
            className="mb-1 block text-sm font-medium"
          >
            Workspace Code
          </label>

          <input
            id="workspaceCode"
            name="workspaceCode"
            type="text"
            value={form.workspaceCode}
            onChange={handleChange}
            className={inputClass("workspaceCode")}
            placeholder="Enter company workspace code"
            required
            disabled={loading}
          />

          {errors.workspaceCode && (
            <p className="mt-1 text-xs text-red-500">{errors.workspaceCode}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="user-password"
            className="mb-1 block text-sm font-medium"
          >
            Password
          </label>

          <input
            id="user-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={inputClass("password")}
            placeholder="Minimum 8 characters"
            disabled={loading}
          />

          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block text-sm font-medium"
          >
            Confirm Password
          </label>

          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={inputClass("confirmPassword")}
            placeholder="Re-enter password"
            disabled={loading}
          />

          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-700 py-3 font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register User"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-violet-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </section>
  );
}
