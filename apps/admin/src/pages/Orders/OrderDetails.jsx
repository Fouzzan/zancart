import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  CreditCard,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Used to prevent an old fetch from overwriting newer state.
  const fetchRequestRef = useRef(0);

  // -----------------------------------------
  // Fetch order
  // -----------------------------------------
  const fetchOrder = async (signal) => {
    const requestId = ++fetchRequestRef.current;

    try {
      setLoading(true);
      setError("");

      const orderResponse = await fetch(`${API_URL}/orders/${id}`, {
        signal,
        cache: "no-store",
      });

      if (!orderResponse.ok) {
        throw new Error("Order not found");
      }

      const orderData = await orderResponse.json();

      // Ignore this response if a newer request has already started.
      if (requestId !== fetchRequestRef.current) {
        return;
      }

      setOrder(orderData);

      // -----------------------------------------
      // Fetch customer
      // -----------------------------------------
      try {
        const usersResponse = await fetch(`${API_URL}/users`, {
          signal,
          cache: "no-store",
        });

        if (usersResponse.ok) {
          const users = await usersResponse.json();

          const foundUser = users.find(
            (item) =>
              item.id === orderData.userId ||
              item.clerkId === orderData.userId ||
              item.userId === orderData.userId,
          );

          if (requestId === fetchRequestRef.current) {
            setUser(foundUser || null);
          }
        }
      } catch (userError) {
        if (userError.name !== "AbortError") {
          console.error("Failed to fetch customer:", userError);
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error("Failed to fetch order:", error);
      setError("Unable to load this order.");
    } finally {
      if (!signal.aborted && requestId === fetchRequestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchOrder(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id]);

  // -----------------------------------------
  // Get valid status transitions
  // -----------------------------------------
  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case "placed":
        return ["placed", "processing", "cancelled"];

      case "processing":
        return ["processing", "shipped", "cancelled"];

      case "shipped":
        return ["shipped", "delivered"];

      case "delivered":
        return ["delivered"];

      case "cancelled":
        return ["cancelled"];

      default:
        return ["placed"];
    }
  };

  // -----------------------------------------
  // Format status label
  // -----------------------------------------
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // -----------------------------------------
  // Order Status update
  // -----------------------------------------
  const handleStatusChange = async (newStatus) => {
    if (!order || updatingStatus) {
      return;
    }

    const currentStatus = order.status || "placed";

    if (newStatus === currentStatus) {
      return;
    }

    const previousOrder = order;

    try {
      setUpdatingStatus(true);
      setError("");

      /*
       * Update the UI immediately.
       * This prevents the Select from visually jumping
       * back while the PATCH request is being processed.
       */
      setOrder((currentOrder) => ({
        ...currentOrder,
        status: newStatus,
      }));

      const response = await fetch(`${API_URL}/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();

      /*
       * Keep the updated server response,
       * but explicitly preserve the requested status.
       *
       * JSON Server should already return the new status,
       * but this makes the UI deterministic.
       */
      setOrder((currentOrder) => ({
        ...currentOrder,
        ...updatedOrder,
        status: newStatus,
      }));
    } catch (error) {
      console.error("Failed to update order status:", error);

      // Roll back only when the PATCH actually fails.
      setOrder(previousOrder);

      setError("Unable to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // -----------------------------------------
  // Helpers
  // -----------------------------------------
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "placed") {
      return (
        <Badge className="border-0 bg-green-100 text-green-700 hover:bg-green-100">
          Placed
        </Badge>
      );
    }

    if (normalizedStatus === "processing") {
      return (
        <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
          Processing
        </Badge>
      );
    }

    if (normalizedStatus === "shipped") {
      return (
        <Badge className="border-0 bg-purple-100 text-purple-700 hover:bg-purple-100">
          Shipped
        </Badge>
      );
    }

    if (normalizedStatus === "delivered") {
      return (
        <Badge className="border-0 bg-green-100 text-green-700 hover:bg-green-100">
          Delivered
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

    return <Badge variant="secondary">{formatStatus(status)}</Badge>;
  };

  const getCustomerName = () => {
    if (user) {
      return (
        user.name ||
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      );
    }

    return (
      order?.address?.fullName || order?.address?.name || "Unknown Customer"
    );
  };

  const getAddressLine = (address) => {
    if (!address) return "No shipping address available.";

    const parts = [
      address.address,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.pincode,
      address.zipCode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------
  if (error || !order) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost">
          <Link to="/orders">
            <ArrowLeft className="mr-2 size-4" />
            Back to Orders
          </Link>
        </Button>

        <Card>
          <CardContent className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-destructive">
              {error || "Order not found."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = order.items || [];

  const itemCount = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const availableStatuses = getAvailableStatuses(order.status);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button asChild variant="ghost" className="-ml-2">
        <Link to="/orders">
          <ArrowLeft className="mr-2 size-4" />
          Back to Orders
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {/* Order information */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{order.id}
            </h1>

            {getStatusBadge(order.status)}
          </div>

          <p className="mt-1 text-muted-foreground">
            Order placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Order Status */}
        <div className="flex w-full flex-col items-start gap-2 sm:w-auto">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ClipboardList className="size-4 text-muted-foreground" />
            <span>Order Status</span>
          </p>

          <Select
            value={order.status || "placed"}
            onValueChange={handleStatusChange}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status update error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Customer */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <User className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Customer</p>

              <p className="mt-1 truncate font-medium">{getCustomerName()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Package className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Items</p>

              <p className="mt-1 font-medium">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <CreditCard className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Payment</p>

              <p className="mt-1 font-medium uppercase">
                {order.paymentMethod || "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Date */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <CalendarDays className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Order Date</p>

              <p className="mt-1 font-medium">
                {order.createdAt
                  ? new Intl.DateTimeFormat("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(order.createdAt))
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer + Shipping */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-muted-foreground" />
              Customer Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>

              <p className="font-medium">{getCustomerName()}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">User ID</p>

              <p className="break-all font-mono text-sm">
                {order.userId || "—"}
              </p>
            </div>

            {user?.email && (
              <>
                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">Email</p>

                  <p className="break-all font-medium">{user.email}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-muted-foreground" />
              Shipping Address
            </CardTitle>
          </CardHeader>

          <CardContent>
            {order.address ? (
              <div className="space-y-2">
                {order.address.fullName && (
                  <p className="font-medium">{order.address.fullName}</p>
                )}

                {order.address.phone && (
                  <p className="text-sm text-muted-foreground">
                    {order.address.phone}
                  </p>
                )}

                <p className="text-sm leading-6 text-muted-foreground">
                  {getAddressLine(order.address)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No shipping address available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ordered Products */}
      <Card>
        <CardHeader>
          <CardTitle>Ordered Products</CardTitle>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No products found for this order.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((item, index) => {
                    const quantity = Number(item.quantity || 0);
                    const price = Number(item.price || 0);
                    const total = price * quantity;

                    return (
                      <TableRow key={`${item.productId || item.id}-${index}`}>
                        <TableCell>
                          <div className="flex min-w-55 items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title || "Product"}
                                className="size-12 shrink-0 rounded-md border object-cover"
                              />
                            ) : (
                              <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                                <Package className="size-5 text-muted-foreground" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-medium">
                                {item.title || "Unnamed Product"}
                              </p>

                              {item.productId && (
                                <p className="text-xs text-muted-foreground">
                                  ID: {item.productId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{formatCurrency(price)}</TableCell>

                        <TableCell>{quantity}</TableCell>

                        <TableCell className="text-right font-medium">
                          {formatCurrency(total)}
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

      {/* Order Summary */}
      <div className="flex justify-end">
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Subtotal</span>

              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {Number(order.discountAmount || 0) > 0 && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Discount</span>

                <span className="text-green-600">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}

            {order.coupon && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Coupon</span>

                <Badge variant="secondary">
                  {typeof order.coupon === "string"
                    ? order.coupon
                    : order.coupon.code || "Applied"}
                </Badge>
              </div>
            )}

            <Separator />

            <div className="flex justify-between gap-4">
              <span className="font-semibold">Total</span>

              <span className="text-lg font-bold">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderDetails;
