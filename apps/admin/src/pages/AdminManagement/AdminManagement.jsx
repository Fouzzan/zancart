import { RefreshCw, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  createAdmin,
  getAuthUsers,
  updateAdminRole,
} from "@/features/users/userService";

function AdminManagement() {
  const admin = useSelector((state) => state.auth.admin);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const users = await getAuthUsers();

      setAdmins(
        users.filter(
          (user) => user.role === "admin" || user.role === "superadmin",
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load admin accounts.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await createAdmin({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setForm({
        name: "",
        email: "",
        password: "",
      });

      setMessage("Admin account created successfully.");
      await loadAdmins();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create admin account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    setError("");
    setMessage("");

    if (user.role === "superadmin") {
      setError("Super Admin accounts cannot be changed here.");
      return;
    }

    if (user.id === admin?.id) {
      setError("You cannot change your own role.");
      return;
    }

    if (!["user", "admin"].includes(newRole)) {
      setError("Invalid role selected.");
      return;
    }

    try {
      await updateAdminRole(user.email, newRole, admin?.id, admin?.role);

      setMessage(`Role updated for ${user.email}.`);
      await loadAdmins();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update the role.",
      );
    }
  };

  if (admin?.role !== "superadmin") {
    return (
      <div className="rounded-xl border bg-background p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 size-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only Super Admins can manage admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Admin Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create admin accounts and manage their permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAdmins}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      <section className="rounded-xl border bg-background p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <UserPlus className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Create Admin Account</h2>
            <p className="text-sm text-muted-foreground">
              Create a new account with admin privileges.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="admin-name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="admin-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                autoComplete="name"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Temporary password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="size-4" />
            {submitting ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border bg-background">
        <div className="flex items-center gap-3 border-b p-5">
          <Users className="size-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Admin Accounts</h2>
            <p className="text-sm text-muted-foreground">
              {admins.length} admin account{admins.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">
            Loading admin accounts...
          </p>
        ) : admins.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No admin accounts found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Permissions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {admins.map((user) => (
                  <tr key={user.id || user.email}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                      {user.name || "Unnamed"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      {user.email}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={
                          user.role === "superadmin"
                            ? "rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800"
                            : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        }
                      >
                        {user.role === "superadmin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      {user.role === "superadmin" ? (
                        <span className="text-xs text-muted-foreground">
                          Full access
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(event) =>
                            handleRoleChange(user, event.target.value)
                          }
                          disabled={user.id === admin?.id}
                          aria-label={`Change role for ${user.email}`}
                          className="rounded-lg border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">Remove admin role</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminManagement;
