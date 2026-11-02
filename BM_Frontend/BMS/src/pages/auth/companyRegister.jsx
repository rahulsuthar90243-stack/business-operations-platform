//register company page
import { useState } from "react";

const API_URL = "http://localhost:4000";

export default function CompanyRegister() {
  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          companyEmail: form.companyEmail.trim().toLowerCase(),
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          contactDetails: {
            username: form.username.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Company registration failed");
      }

      setSuccess(
        data.message || "Company registered successfully!"
      );

      setForm({
        companyName: "",
        companyEmail: "",
        username: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        password: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Company Registration
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create a workspace for your organization.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Company Name
          </label>
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter company name"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Company Email
          </label>
          <input
            name="companyEmail"
            type="email"
            value={form.companyEmail}
            onChange={handleChange}
            className={inputClass}
            placeholder="company@example.com"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Owner Name
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className={inputClass}
              placeholder="Your name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Owner Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="owner@example.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Admin Password
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
            placeholder="Create admin password"
            minLength={8}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="Phone number"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Address
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className={inputClass}
            placeholder="Street address"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {["city", "state", "country"].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium capitalize">
                {field}
              </label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                className={inputClass}
                placeholder={field}
                required
                disabled={loading}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registering Company..." : "Register Company"}
        </button>
      </form>
    </section>
  );
}
