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

  // -----------------------------------------
  // Fetch users + orders
  // -----------------------------------------
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
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      dispatch(setError("Unable to load users."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -----------------------------------------
  // Helpers
  // -----------------------------------------
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
    return user.status === "blocked" ? "blocked" : "active";
  };

  // -----------------------------------------
  // Order count
  // -----------------------------------------
  const getOrderCount = (user) => {
    return orders.filter(
      (order) =>
        order.userId === user.clerkId ||
        order.userId === user.id ||
        order.userId === user.userId,
    ).length;
  };

  // -----------------------------------------
  // Search + filter
  // -----------------------------------------
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = getUserEmail(user).toLowerCase();
      const clerkId = String(user.clerkId || "").toLowerCase();

      const status = getUserStatus(user);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        clerkId.includes(query);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, orders, searchQuery, statusFilter]);

  // -----------------------------------------
  // Role badge
  // -----------------------------------------
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

  // -----------------------------------------
  // Status badge
  // -----------------------------------------
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

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------
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

      {/* Users Card */}
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

              {/* Status Filter */}
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
                                {user.clerkId || user.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="text-muted-foreground">
                          {getUserEmail(user)}
                        </TableCell>

                        {/* Orders */}
                        <TableCell>{getOrderCount(user)}</TableCell>

                        {/* Role */}
                        <TableCell>{getRoleBadge(role)}</TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(status)}</TableCell>

                        {/* View */}
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
