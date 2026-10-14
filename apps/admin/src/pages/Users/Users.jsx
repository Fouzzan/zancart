import { Eye, EyeOff, Search, Users as UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createUser,
  getAuthUsers,
  getUsers,
} from "@/features/users/userService";
import { setError, setLoading, setUsers } from "@/features/users/userSlice";

function Users() {
  const dispatch = useDispatch();

  const { users, loading, error } = useSelector((state) => state.users);

  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [dataWarning, setDataWarning] = useState("");

  const [savingUser, setSavingUser] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const API_URL = (import.meta.env.VITE_API_URL || "").trim();
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleCreateUser = async (event) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name || !email || !formData.password || !formData.confirmPassword) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      setSavingUser(true);

      await createUser({
        name,
        email,
        password: formData.password,
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setShowAddUser(false);
      setFormSuccess("Customer created successfully.");

      // Reload both user sources.
      await fetchData();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to create user. Please try again.",
      );
    } finally {
      setSavingUser(false);
    }
  };

  // Fetch users and orders
  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      setDataWarning("");

      const [storeUsersResult, authUsersResult, ordersResult] =
        await Promise.allSettled([
          getUsers(),
          getAuthUsers(),
          fetch(`${API_URL}/orders`),
        ]);

      const storeUsers =
        storeUsersResult.status === "fulfilled" &&
        Array.isArray(storeUsersResult.value)
          ? storeUsersResult.value.map((user) => ({
              ...user,
              source: user.source || "store",
            }))
          : [];

      const authUsers =
        authUsersResult.status === "fulfilled" &&
        Array.isArray(authUsersResult.value)
          ? authUsersResult.value.map((user) => ({
              ...user,
              source: "auth",
            }))
          : [];

      if (storeUsersResult.status === "rejected") {
        console.error("Failed to fetch store users:", storeUsersResult.reason);
      }

      if (authUsersResult.status === "rejected") {
        console.error("Failed to fetch auth users:", authUsersResult.reason);
      }

      let ordersData = [];

      if (ordersResult.status === "fulfilled" && ordersResult.value.ok) {
        ordersData = await ordersResult.value.json();
      } else {
        console.error(
          "Failed to fetch orders:",
          ordersResult.status === "rejected"
            ? ordersResult.reason
            : ordersResult.value,
        );
        setDataWarning(
          "Orders could not be loaded. User accounts are still shown.",
        );
      }

      const mergedUsers = [...storeUsers, ...authUsers];

      if (mergedUsers.length === 0) {
        const authError =
          authUsersResult.status === "rejected"
            ? authUsersResult.reason?.response?.data?.message ||
              authUsersResult.reason?.message
            : "";

        const storeError =
          storeUsersResult.status === "rejected"
            ? storeUsersResult.reason?.response?.data?.message ||
              storeUsersResult.reason?.message
            : "";

        throw new Error(authError || storeError || "Unable to load users.");
      }

      dispatch(setUsers(mergedUsers));
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      dispatch(
        setError(
          err.message === "Route not found."
            ? "The auth API does not expose the admin users endpoint yet."
            : err.message || "Unable to load users.",
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
    // Initial data load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize IDs before comparing them
  const normalizeId = (value) => {
    if (value === null || value === undefined) return "";

    const normalized = String(value).trim();

    // Guest orders cannot reliably be assigned to a registered user.
    if (!normalized || normalized.toLowerCase() === "guest") {
      return "";
    }

    return normalized;
  };

  // User helpers
  const getUserName = (user) => {
    return (
      user.name ||
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unknown User"
    );
  };

  const getUserEmail = (user) => {
    return user.email || user.emailAddress || "No email";
  };

  const getUserRole = (user) => {
    return user.role === "admin" ? "admin" : "user";
  };

  const getUserStatus = (user) => {
    if (user.status === "blocked" || user.isBlocked === true) {
      return "blocked";
    }

    return "active";
  };

  // Calculate the number of orders belonging to a user
  const getOrderCount = (user) => {
    const userIds = new Set(
      (user._userIds || [user.clerkId, user.id, user.userId])
        .map(normalizeId)
        .filter(Boolean),
    );

    const userEmail = String(user.email || user.emailAddress || "")
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const orderUserId = normalizeId(
        order.userId ??
          order.clerkId ??
          order.user?.id ??
          order.user?.clerkId ??
          order.customerId,
      );

      // Match by user ID first
      if (orderUserId && userIds.has(orderUserId)) {
        return true;
      }

      // Fall back to email only if the order explicitly stores it
      const orderEmail = String(
        order.userEmail ??
          order.customerEmail ??
          order.email ??
          order.user?.email ??
          "",
      )
        .trim()
        .toLowerCase();

      return Boolean(userEmail && orderEmail && userEmail === orderEmail);
    }).length;
  };

  // Remove duplicate user records with the same email
  const uniqueUsers = useMemo(() => {
    const usersByEmail = new Map();

    users.forEach((user) => {
      const email = getUserEmail(user).trim().toLowerCase();
      const key = email || `id:${user.id}`;

      const existingUser = usersByEmail.get(key);

      if (!existingUser) {
        usersByEmail.set(key, {
          ...user,
          _userIds: [user.id, user.clerkId, user.userId].filter(Boolean),
        });

        return;
      }

      const existingIds = existingUser._userIds || [];
      const newIds = [user.id, user.clerkId, user.userId].filter(Boolean);

      existingUser._userIds = [...new Set([...existingIds, ...newIds])];

      const shouldPreferUser =
        user.source === "auth" ||
        (user.role === "admin" && existingUser.role !== "admin");

      if (shouldPreferUser) {
        usersByEmail.set(key, {
          ...user,
          _userIds: existingUser._userIds,
          _sources: [
            ...new Set(
              [...(existingUser._sources || []), user.source].filter(Boolean),
            ),
          ],
        });
      }
    });

    return Array.from(usersByEmail.values());
  }, [users]);

  // Search and filter users
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return uniqueUsers.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = getUserEmail(user).toLowerCase();

      const userId = String(
        user.clerkId || user.userId || user.id || "",
      ).toLowerCase();

      const status = getUserStatus(user);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        userId.includes(query);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [uniqueUsers, searchQuery, statusFilter]);

  // Role badge
  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
          Admin
        </Badge>
      );
    }

    return <Badge variant="secondary">User</Badge>;
  };

  // Status badge
  const getStatusBadge = (status) => {
    if (status === "blocked") {
      return (
        <Badge variant="destructive" className="border-0">
          Blocked
        </Badge>
      );
    }

    return (
      <Badge className="border-0 bg-green-100 text-green-700 hover:bg-green-100">
        Active
      </Badge>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            View and manage customer accounts.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={fetchData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            View and manage customer accounts.
          </p>
        </div>

        {/* <Button
          onClick={() => {
            setFormError("");
            setFormSuccess("");
            setShowAddUser((current) => !current);
          }}
        >
          {showAddUser ? (
            <X className="mr-2 size-4" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          {showAddUser ? "Cancel" : "Add User"}
        </Button> */}
      </div>

      {formSuccess && (
        <p className="text-sm text-green-600" role="status">
          {formSuccess}
        </p>
      )}

      {dataWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {dataWarning}
        </div>
      )}

      {showAddUser && (
        <Card>
          <CardHeader>
            <CardTitle>Create Customer Account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a customer account using your custom authentication system.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="new-user-name"
                    className="text-sm font-medium"
                  >
                    Full Name
                  </label>
                  <Input
                    id="new-user-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="new-user-email"
                    className="text-sm font-medium"
                  >
                    Email Address
                  </label>
                  <Input
                    id="new-user-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="customer@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="new-user-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Input
                      id="new-user-password"
                      type={showPassword ? "text" : "password"}
                      minLength={6}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Minimum 6 characters"
                      className="pr-10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="new-user-confirm"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Input
                      id="new-user-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Re-enter password"
                      className="pr-10"
                      required
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

              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddUser(false)}
                  disabled={savingUser}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={savingUser}>
                  {savingUser ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search users..."
                  className="pl-9"
                />
              </div>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <UsersIcon className="size-5 text-muted-foreground" />
              </div>

              <div className="text-center">
                <p className="font-medium">No users found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try changing your search or filter."
                    : "No users have been registered yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user) => {
                    const role = getUserRole(user);
                    const status = getUserStatus(user);

                    return (
                      <TableRow key={user.id}>
                        {/* User */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                              {user.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt={getUserName(user)}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-muted-foreground">
                                  {getUserName(user).charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium">{getUserName(user)}</p>

                              <p className="max-w-48 truncate font-mono text-xs text-muted-foreground">
                                {user.clerkId || user.userId || user.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="text-muted-foreground">
                          {getUserEmail(user)}
                        </TableCell>

                        {/* Order count */}
                        <TableCell>{getOrderCount(user)}</TableCell>

                        {/* Role */}
                        <TableCell>{getRoleBadge(role)}</TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(status)}</TableCell>

                        {/* View user */}
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/users/${user.id}`}>
                              <Eye className="mr-2 size-4" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Users;
