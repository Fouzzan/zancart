import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Mail,
  Package,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  blockUser,
  getUserById,
  unblockUser,
} from "@/features/users/userService";

import { updateAdminRole } from "@/features/users/userService";

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // -----------------------------------------
  // Fetch user + orders
  // -----------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [userResponse, ordersResponse] = await Promise.all([
          getUserById(id),
          fetch(`${API_URL}/orders`),
        ]);

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders.");
        }

        const ordersData = await ordersResponse.json();

        setUser(userResponse);

        const userOrders = ordersData.filter(
          (order) =>
            order.userId === userResponse.clerkId ||
            order.userId === userResponse.id ||
            order.userId === userResponse.userId,
        );

        setOrders(userOrders);
      } catch (error) {
        console.error("Failed to load user details:", error);

        setError("Unable to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, API_URL]);

  // -----------------------------------------
  // Block / Unblock
  // -----------------------------------------
  const handleStatusChange = async () => {
    if (!user) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const updatedUser =
        user.status === "blocked"
          ? await unblockUser(user.id)
          : await blockUser(user.id);

      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user status:", error);

      setError("Failed to update account status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAdminRoleChange = async () => {
    if (!user?.clerkId) {
      setError("This user does not have a Clerk ID.");
      return;
    }

    try {
      setUpdatingRole(true);
      setError("");

      const newRole = user.role === "admin" ? "user" : "admin";

      await updateAdminRole(user.clerkId, newRole);

      /*
       * Keep JSON Server synchronized with Clerk.
       */
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to synchronize user role.");
      }

      const updatedUser = await response.json();

      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update admin access:", error);

      setError(error.message || "Failed to update admin access.");
    } finally {
      setUpdatingRole(false);
    }
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading user details...</p>
      </div>
    );
  }

  // -----------------------------------------
  // Error / User not found
  // -----------------------------------------
  if (error && !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Users
        </Button>

        <Card>
          <CardContent className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Users
        </Button>

        <Card>
          <CardContent className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">User not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------------------
  // User information
  // -----------------------------------------
  const userName =
    user.name ||
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Unknown User";

  const userEmail = user.email || user.emailAddress || "No email";

  const role = user.role === "admin" ? "admin" : "user";

  const status = user.status === "blocked" ? "blocked" : "active";

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <div className="space-y-6">
      {/* -------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------- */}

      <div>
        <Button
          variant="ghost"
          className="-ml-3 mb-2"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Users
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>

        <p className="text-muted-foreground">
          View and manage this user's account.
        </p>
      </div>

      {/* -------------------------------------- */}
      {/* Error message */}
      {/* -------------------------------------- */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* -------------------------------------- */}
      {/* Profile + Account Information */}
      {/* -------------------------------------- */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="mb-4 flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={userName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-muted-foreground">
                    {initials}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold">{userName}</h2>

              <p className="mt-1 text-sm text-muted-foreground">{userEmail}</p>

              <div className="mt-3">
                {role === "admin" ? (
                  <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>

                <p className="break-all text-sm font-medium">{userEmail}</p>
              </div>
            </div>

            {/* Clerk ID */}
            <div className="flex gap-3">
              <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Clerk ID</p>

                <p className="break-all font-mono text-xs">
                  {user.clerkId || user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Role */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Shield className="size-4 text-muted-foreground" />

                  <p className="text-sm font-medium">Role</p>
                </div>

                {role === "admin" ? (
                  <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </div>

              {/* Status */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />

                  <p className="text-sm font-medium">Account Status</p>
                </div>

                {status === "blocked" ? (
                  <Badge variant="destructive" className="border-0">
                    Blocked
                  </Badge>
                ) : (
                  <Badge className="border-0 bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                  </Badge>
                )}
              </div>

              {/* Orders */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />

                  <p className="text-sm font-medium">Total Orders</p>
                </div>

                <p className="text-2xl font-semibold">{orders.length}</p>
              </div>

              {/* Joined */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />

                  <p className="text-sm font-medium">Joined</p>
                </div>

                <p className="text-sm">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------- */}
      {/* Account Actions */}
      {/* -------------------------------------- */}

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {status === "blocked"
                  ? "This account is blocked"
                  : "This account is active"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {status === "blocked"
                  ? "Unblocking will restore the user's active account status."
                  : "Blocking will mark this account as blocked."}
              </p>
            </div>

            {status === "blocked" ? (
              <Button
                variant="outline"
                onClick={handleStatusChange}
                disabled={updatingStatus}
              >
                <CheckCircle className="mr-2 size-4" />

                {updatingStatus ? "Unblocking..." : "Unblock User"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleStatusChange}
                disabled={updatingStatus}
              >
                <Ban className="mr-2 size-4" />

                {updatingStatus ? "Blocking..." : "Block User"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {role === "admin"
                  ? "Admin access enabled"
                  : "Admin access disabled"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {role === "admin"
                  ? "This user can access admin functionality."
                  : "This user has normal customer access."}
              </p>
            </div>

            <Button
              variant={role === "admin" ? "destructive" : "default"}
              onClick={handleAdminRoleChange}
              disabled={updatingRole}
            >
              {updatingRole
                ? "Updating..."
                : role === "admin"
                  ? "Disable Admin Access"
                  : "Enable Admin Access"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------- */}
      {/* Order History */}
      {/* -------------------------------------- */}

      <Card>
        <CardHeader>
          <CardTitle>Order History ({orders.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {orders.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                This user has no orders yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Order ID</th>

                    <th className="px-4 py-3 font-medium">Date</th>

                    <th className="px-4 py-3 font-medium">Amount</th>

                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">
                        {order.id}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        ₹
                        {Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {order.status || "Unknown"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
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
