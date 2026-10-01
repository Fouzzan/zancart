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

function Orders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // -----------------------------------------
  // Fetch orders + users
  // -----------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/users`),
      ]);

      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders");
      }

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }

      const ordersData = await ordersResponse.json();
      const usersData = await usersResponse.json();

      setOrders(ordersData);
      setUsers(usersData);
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

  // -----------------------------------------
  // Find customer
  // -----------------------------------------
  const getCustomerName = (order) => {
    const user = users.find(
      (user) =>
        user.id === order.userId ||
        user.clerkId === order.userId ||
        user.userId === order.userId,
    );

    if (user) {
      return (
        user.name ||
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        order.address?.fullName ||
        "Unknown Customer"
      );
    }

    return order.address?.fullName || "Unknown Customer";
  };

  // -----------------------------------------
  // Number of items
  // -----------------------------------------
  const getItemCount = (order) => {
    return (
      order.items?.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ) || 0
    );
  };

  // -----------------------------------------
  // Format currency
  // -----------------------------------------
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  // -----------------------------------------
  // Format date
  // -----------------------------------------
  const formatDate = (date) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // -----------------------------------------
  // Status badge
  // -----------------------------------------
  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "placed") {
      return (
        <Badge className="border-0 bg-green-100 text-green-700 hover:bg-green-100">
          Placed
        </Badge>
      );
    }

    if (normalizedStatus === "cancelled") {
      return (
        <Badge className="border-0 bg-red-100 text-red-700 hover:bg-red-100">
          Cancelled
        </Badge>
      );
    }

    return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  };

  // -----------------------------------------
  // Filter orders
  // -----------------------------------------
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = getCustomerName(order).toLowerCase();

      const matchesSearch =
        !query ||
        order.id?.toLowerCase().includes(query) ||
        customerName.includes(query);

      const matchesStatus =
        statusFilter === "all" || order.status?.toLowerCase() === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentMethod?.toLowerCase() === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, users, searchQuery, statusFilter, paymentFilter]);

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading orders...</p>
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
                  <TableRow className="bg-muted/50">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      {/* Order ID */}
                      <TableCell>
                        <span className="font-medium">#{order.id}</span>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {getCustomerName(order)}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {order.userId}
                          </p>
                        </div>
                      </TableCell>

                      {/* Items */}
                      <TableCell>
                        {getItemCount(order)}{" "}
                        {getItemCount(order) === 1 ? "item" : "items"}
                      </TableCell>

                      {/* Total */}
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>

                      {/* Payment */}
                      <TableCell>
                        <span className="uppercase">
                          {order.paymentMethod || "—"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(order.status)}</TableCell>

                      {/* Date */}
                      <TableCell className="whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to={`/orders/${order.id}`}
                            className="flex items-center gap-2"
                          >
                            <Eye className="size-4" />
                            <span>View</span>
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
