import { Eye, Search, Users as UsersIcon } from "lucide-react";
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

import { getUsers } from "@/features/users/userService";
import { setError, setLoading, setUsers } from "@/features/users/userSlice";

function Users() {
  const dispatch = useDispatch();

  const { users, loading, error } = useSelector((state) => state.users);

  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch users and orders
  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const [usersData, ordersResponse] = await Promise.all([
        getUsers(),
        fetch(`${API_URL}/orders`),
      ]);

      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders");
      }

      const ordersData = await ordersResponse.json();

      dispatch(setUsers(usersData));
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Failed to fetch users and orders:", err);
      dispatch(setError("Unable to load users or orders."));
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

      // Prefer the admin record if duplicate records exist
      if (user.role === "admin" && existingUser.role !== "admin") {
        usersByEmail.set(key, {
          ...user,
          _userIds: existingUser._userIds,
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          View and manage customer accounts.
        </p>
      </div>

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
