import { Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

import { getOrders, getUsers } from "@/features/orders/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // ============================================================
  // Fetch orders and users
  // ============================================================
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, usersData] = await Promise.all([
        getOrders(),
        getUsers(),
      ]);

      // Newest orders first
      const sortedOrders = [...ordersData].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      setOrders(sortedOrders);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // Find customer for an order
  // ============================================================
  const getCustomer = (userId) => {
    return users.find(
      (user) =>
        user.id === userId || user.clerkId === userId || user.userId === userId,
    );
  };

  // ============================================================
  // Get customer display name
  // ============================================================
  const getCustomerName = (order) => {
    const customer = getCustomer(order.userId);

    if (customer) {
      const fullName =
        customer.name ||
        customer.fullName ||
        [customer.firstName, customer.lastName].filter(Boolean).join(" ");

      if (fullName) {
        return fullName;
      }

      if (customer.email) {
        return customer.email;
      }
    }

    // Fallback to the name saved inside the order address
    if (order.address?.fullName) {
      return order.address.fullName;
    }

    return "Unknown Customer";
  };

  // ============================================================
  // Get customer email
  // ============================================================
  const getCustomerEmail = (order) => {
    const customer = getCustomer(order.userId);

    return customer?.email || order.email || "—";
  };

  // ============================================================
  // Format date
  // ============================================================
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // Format currency
  // ============================================================
  const formatCurrency = (amount) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
      return "₹0.00";
    }

    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ============================================================
  // Get actual unit count
  // ============================================================
  // Important for deals such as BOGO.
  //
  // Example:
  // quantity: 1
  // paidQuantity: 1
  // freeQuantity: 1
  //
  // Actual products leaving inventory = 2
  // ============================================================
  const getItemQuantity = (item) => {
    const paidQuantity = Number(item?.paidQuantity ?? item?.quantity ?? 0);

    const freeQuantity = Number(item?.freeQuantity ?? 0);

    return paidQuantity + freeQuantity;
  };

  // ============================================================
  // Get total units in an order
  // ============================================================
  const getOrderItemCount = (order) => {
    if (!Array.isArray(order.items)) {
      return 0;
    }

    return order.items.reduce(
      (total, item) => total + getItemQuantity(item),
      0,
    );
  };

  // ============================================================
  // Get status badge
  // ============================================================
  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();

    const statusStyles = {
      placed:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",

      processing:
        "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300",

      shipped:
        "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300",

      delivered:
        "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",

      cancelled:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    };

    const label = normalizedStatus
      ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
      : "Unknown";

    return (
      <Badge
        variant="outline"
        className={
          statusStyles[normalizedStatus] ||
          "border-muted bg-muted text-muted-foreground"
        }
      >
        {label}
      </Badge>
    );
  };

  // ============================================================
  // Filter orders
  // ============================================================
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = getCustomerName(order).toLowerCase();

      const customerEmail = getCustomerEmail(order).toLowerCase();

      const orderId = String(order.id || "").toLowerCase();

      const paymentMethod = String(order.paymentMethod || "").toLowerCase();

      const status = String(order.status || "").toLowerCase();

      // Search
      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        paymentMethod.includes(query);

      // Status
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      // Payment
      const matchesPayment =
        paymentFilter === "all" || paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, users, searchQuery, statusFilter, paymentFilter]);

  // ============================================================
  // Loading state
  // ============================================================
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

          <p className="text-muted-foreground">
            View and manage customer orders.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // Error state
  // ============================================================
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

          <p className="text-muted-foreground">
            View and manage customer orders.
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

  // ============================================================
  // Main UI
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

        <p className="text-muted-foreground">
          View and manage customer orders.
        </p>
      </div>

      {/* Orders Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search orders..."
                  className="pl-9"
                />
              </div>

              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>

                  <SelectItem value="placed">Placed</SelectItem>

                  <SelectItem value="processing">Processing</SelectItem>

                  <SelectItem value="shipped">Shipped</SelectItem>

                  <SelectItem value="delivered">Delivered</SelectItem>

                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>

                  <SelectItem value="cod">COD</SelectItem>

                  <SelectItem value="upi">UPI</SelectItem>

                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                {searchQuery ||
                statusFilter !== "all" ||
                paymentFilter !== "all"
                  ? "No orders match your filters."
                  : "No orders found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>

                    <TableHead>Customer</TableHead>

                    <TableHead>Date</TableHead>

                    <TableHead>Items</TableHead>

                    <TableHead>Payment</TableHead>

                    <TableHead>Total</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      {/* Order */}
                      <TableCell>
                        <p className="font-medium">#{order.id}</p>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <div className="max-w-48">
                          <p className="truncate font-medium">
                            {getCustomerName(order)}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {getCustomerEmail(order)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell>{formatDate(order.createdAt)}</TableCell>

                      {/* Items */}
                      <TableCell>{getOrderItemCount(order)}</TableCell>

                      {/* Payment */}
                      <TableCell>
                        <span className="capitalize">
                          {order.paymentMethod || "—"}
                        </span>
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(order.status)}</TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/orders/${order.id}`}>
                            <Eye className="mr-2 size-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Orders;
