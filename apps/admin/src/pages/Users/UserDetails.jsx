import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  ShieldOff,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getOrders } from "@/features/orders/orderService";
import {
  changeUserPassword,
  getUserById,
  updateAdminRole,
  updateUserStatus,
} from "@/features/users/userService";

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [error, setError] = useState("");

  // ---------------------------------------------------------------------------
  // Fetch User
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUserById(id);

        // Support services that return either a user or an API response.
        const userData =
          response?.data?.user ?? response?.data ?? response?.user ?? response;

        if (!cancelled) {
          setUser(userData);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);

        if (!cancelled) {
          setUser(null);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load user.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchUser();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ---------------------------------------------------------------------------
  // Fetch Orders and Match Them to This User
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchUserOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }

      try {
        setLoadingOrders(true);

        const response = await getOrders();

        const allOrders = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.orders)
              ? response.orders
              : Array.isArray(response?.data?.orders)
                ? response.data.orders
                : [];

        // IMPORTANT:
        // The JSON Server user ID may differ from the Clerk ID.
        // Orders use the Clerk ID in their userId field.
        const possibleUserIds = [
          user.id,
          user.userId,
          user.clerkId,
          user.authId,
          user.externalId,
        ]
          .filter(Boolean)
          .map(String);

        const userEmail = String(user.email || "")
          .trim()
          .toLowerCase();

        const filteredOrders = allOrders.filter((order) => {
          const orderUserId = String(
            order.userId ??
              order.user?.id ??
              order.user?.clerkId ??
              order.customerId ??
              "",
          );

          const matchesId =
            orderUserId !== "" && possibleUserIds.includes(orderUserId);

          const orderEmail = String(
            order.userEmail ??
              order.email ??
              order.customerEmail ??
              order.user?.email ??
              "",
          )
            .trim()
            .toLowerCase();

          const matchesEmail =
            Boolean(userEmail) &&
            Boolean(orderEmail) &&
            orderEmail === userEmail;

          return matchesId || matchesEmail;
        });

        if (!cancelled) {
          setOrders(filteredOrders);
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);

        if (!cancelled) {
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      }
    };

    fetchUserOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ---------------------------------------------------------------------------
  // User Status
  // ---------------------------------------------------------------------------

  const isBlocked = useMemo(() => {
    if (!user) return false;

    if (typeof user.isBlocked === "boolean") {
      return user.isBlocked;
    }

    return user.status === "blocked";
  }, [user]);

  // ---------------------------------------------------------------------------
  // Block / Unblock User
  // ---------------------------------------------------------------------------

  const handleStatusChange = async () => {
    if (!user) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const newBlockedStatus = !isBlocked;
      const response = await updateUserStatus(user.id, newBlockedStatus);

      if (!response) {
        throw new Error("Failed to update user status.");
      }

      setUser((currentUser) => ({
        ...currentUser,
        isBlocked: newBlockedStatus,
        status: newBlockedStatus ? "blocked" : "active",
      }));
    } catch (err) {
      console.error("Failed to update user status:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update user status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Enable / Disable Admin Access
  // ---------------------------------------------------------------------------

  const handleAdminRoleChange = async () => {
    if (!user?.email) return;

    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      setUpdatingRole(true);
      setError("");

      const response = await updateAdminRole(user.email, newRole);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update admin access.");
      }

      setUser((currentUser) => ({
        ...currentUser,
        role: newRole,
      }));
    } catch (err) {
      console.error("Failed to update admin access:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update admin access.",
      );
    } finally {
      setUpdatingRole(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Change Password
  // ---------------------------------------------------------------------------

  const handleChangePassword = async (event) => {
    event?.preventDefault();

    if (!user?.email) {
      setPasswordError("User email is unavailable.");
      return;
    }

    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Please confirm the new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changeUserPassword(user.email, newPassword);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to change password.");
      }

      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPasswordSuccess("Password changed successfully.");
    } catch (err) {
      console.error("Failed to change password:", err);

      setPasswordError(
        err.response?.data?.message ||
          err.message ||
          "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading user...</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // User Not Found
  // ---------------------------------------------------------------------------

  if (!user) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="flex min-h-[250px] items-center justify-center">
            <div className="text-center">
              <UserX className="mx-auto mb-3 size-10 text-muted-foreground" />
              <h2 className="text-lg font-semibold">User not found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The requested user could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Order Statistics
  // ---------------------------------------------------------------------------

  const totalOrders = orders.length;

  // The order schema uses totalAmount.
  // This total includes all matched orders, including cancelled orders.
  const totalSpent = orders.reduce((total, order) => {
    const amount = Number(
      order.totalAmount ?? order.total ?? order.amount ?? 0,
    );

    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  // ---------------------------------------------------------------------------
  // Main UI
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
            <p className="text-sm text-muted-foreground">
              View and manage this user's account.
            </p>
          </div>
        </div>

        <Badge
          variant={isBlocked ? "destructive" : "default"}
          className="w-fit"
        >
          {isBlocked ? "Blocked" : "Active"}
        </Badge>
      </div>

      {/* General Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Profile and Account Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Profile Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <User className="size-7 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {user.name || user.fullName || "Unnamed User"}
                </h2>
                <p className="break-all text-sm text-muted-foreground">
                  {user.email || "No email"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 font-medium">
                  {user.name || user.fullName || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 break-all font-medium">
                  {user.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1 font-medium">
                  {user.phone || user.phoneNumber || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  User ID
                </p>
                <p className="mt-1 break-all font-mono text-xs">
                  {user.id || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Account Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  Control whether this user can access the store.
                </p>
              </div>

              <Badge variant={isBlocked ? "destructive" : "default"}>
                {isBlocked ? "Blocked" : "Active"}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Account Role</p>
                <p className="text-sm text-muted-foreground">
                  {user.role === "admin"
                    ? "This user has admin access."
                    : "This user has standard access."}
                </p>
              </div>

              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Account Created
              </p>
              <p className="mt-1 font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Block / Unblock */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {isBlocked ? "Unblock User" : "Block User"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isBlocked
                  ? "Allow this user to access their account again."
                  : "Prevent this user from accessing their account."}
              </p>
            </div>

            <Button
              variant={isBlocked ? "default" : "destructive"}
              onClick={handleStatusChange}
              disabled={updatingStatus}
              className="gap-2"
            >
              {isBlocked ? (
                <CheckCircle className="size-4" />
              ) : (
                <Ban className="size-4" />
              )}

              {updatingStatus
                ? "Updating..."
                : isBlocked
                  ? "Unblock User"
                  : "Block User"}
            </Button>
          </div>

          <Separator />

          {/* Admin Access */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {user.role === "admin"
                  ? "Remove Admin Access"
                  : "Grant Admin Access"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user.role === "admin"
                  ? "Remove administrator privileges from this user."
                  : "Give this user access to the ZanCart admin panel."}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleAdminRoleChange}
              disabled={updatingRole}
              className="gap-2"
            >
              {user.role === "admin" ? (
                <ShieldOff className="size-4" />
              ) : (
                <Shield className="size-4" />
              )}

              {updatingRole
                ? "Updating..."
                : user.role === "admin"
                  ? "Remove Admin"
                  : "Make Admin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Account Security
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Set a new password for this user.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    name="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((current) => !current)}
                    className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {passwordError}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters.
            </p>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={changingPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>

            {passwordSuccess && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700"
              >
                <CheckCircle className="size-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="mt-2 text-3xl font-bold">
              {loadingOrders ? "..." : totalOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="mt-2 text-3xl font-bold">
              {loadingOrders
                ? "..."
                : `₹${totalSpent.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>

        <CardContent>
          {loadingOrders ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center">
              <UserCheck className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium">No orders found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This user hasn't placed any orders yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Items</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order, index) => {
                    const orderItems = order.items || order.products || [];

                    const orderTotal = Number(
                      order.totalAmount ?? order.total ?? order.amount ?? 0,
                    );

                    const orderDate =
                      order.createdAt || order.date || order.orderDate;

                    return (
                      <tr
                        key={order.id || order.orderId || index}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-4 font-medium">
                          {order.id || order.orderId || "—"}
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {orderDate &&
                          !Number.isNaN(new Date(orderDate).getTime())
                            ? new Date(orderDate).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant="secondary">
                            {order.status || "Pending"}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          {Array.isArray(orderItems) ? orderItems.length : 0}
                        </td>

                        <td className="px-4 py-4 text-right font-medium">
                          ₹
                          {(Number.isFinite(orderTotal)
                            ? orderTotal
                            : 0
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserDetails;
