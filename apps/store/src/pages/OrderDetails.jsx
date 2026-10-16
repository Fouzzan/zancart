import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Gift,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuthContext } from "../context/AuthContext";
import { cancelOrder, getOrderById } from "../services/orderServices";

function OrderDetails() {
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuthContext();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = user?.userId || user?.id;

  const fetchOrder = useCallback(
    async (showLoading = false) => {
      if (!id || !userId) {
        setOrder(null);
        setLoading(false);
        return;
      }

      if (showLoading) setLoading(true);

      try {
        const data = await getOrderById(id);

        // Ensure the order belongs to the signed-in user.
        if (String(data?.userId) !== String(userId)) {
          setOrder(null);
          navigate("/orders", { replace: true });
          toast.error("Order not found or access denied.");
          return;
        }

        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);

        if (showLoading) {
          toast.error("Failed to load order details.");
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [id, userId, navigate],
  );

  useEffect(() => {
    if (isAuthLoading) return;

    if (!userId) {
      setOrder(null);
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    const loadOrder = async (showLoading = false) => {
      if (showLoading) setLoading(true);

      try {
        const data = await getOrderById(id);

        if (cancelled) return;

        // Keep ownership checks compatible with legacy user IDs.
        if (String(data?.userId) !== String(userId)) {
          setOrder(null);
          navigate("/orders", { replace: true });
          toast.error("Order not found or access denied.");
          return;
        }

        setOrder(data);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch order:", error);

          if (showLoading) {
            toast.error("Failed to load order details.");
          }
        }
      } finally {
        if (!cancelled && showLoading) setLoading(false);
      }
    };

    loadOrder(true);

    // Refresh order status every 10 seconds.
    const interval = setInterval(() => {
      loadOrder(false);
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, userId, isAuthLoading, navigate]);

  const handleCancelOrder = async () => {
    if (!order || cancelling) return;

    try {
      setCancelling(true);

      const updatedOrder = await cancelOrder(order.id);
      setOrder(updatedOrder);

      toast.success("Order cancelled successfully.");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel the order. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Order not found</h1>
          <Button
            onClick={() => navigate("/orders")}
            className="mt-6 rounded-full"
          >
            Back to Orders
          </Button>
        </div>
      </main>
    );
  }

  const canCancel = order.status === "placed" || order.status === "processing";

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Deal-aware order item helpers.
  const getPaidQuantity = (item) =>
    Number(item.paidQuantity ?? item.quantity ?? 0);

  const getFreeQuantity = (item) => Number(item.freeQuantity ?? 0);

  const getTotalQuantity = (item) =>
    getPaidQuantity(item) + getFreeQuantity(item);

  const getItemPrice = (item) => Number(item.price ?? item.discountPrice ?? 0);

  const getItemTotal = (item) => {
    if (item.totalPrice !== undefined) {
      return Number(item.totalPrice);
    }

    // Free items are not charged again.
    return getItemPrice(item) * getPaidQuantity(item);
  };

  const getDealTitle = (item) => item.deal?.title || item.dealTitle || null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/orders")}
        className="-ml-2 mb-6 rounded-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      {/* Order Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Placed on {orderDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {order.status === "cancelled" ? (
              <XCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span className="font-medium capitalize">{order.status}</span>
          </div>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={cancelling}
                  className="rounded-full"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.preventDefault();
                      handleCancelOrder();
                    }}
                  >
                    Cancel Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: order details */}
        <div className="space-y-6">
          {/* Order Status */}
          <section className="rounded-2xl border p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Order Status</h2>
            </div>

            {order.status === "cancelled" ? (
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <XCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground">
                    This order has been cancelled.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {[
                  {
                    key: "placed",
                    label: "Order Placed",
                    description: "Your order has been successfully placed.",
                  },
                  {
                    key: "shipped",
                    label: "Shipped",
                    description: "Your order is on its way.",
                  },
                  {
                    key: "delivered",
                    label: "Delivered",
                    description: "Your order has been delivered.",
                  },
                ].map((step, index) => {
                  const statuses = [
                    "placed",
                    "processing",
                    "shipped",
                    "delivered",
                  ];
                  const currentIndex = statuses.indexOf(order.status);
                  const stepIndex =
                    step.key === "placed" ? 0 : step.key === "shipped" ? 2 : 3;

                  const isCompleted =
                    currentIndex >= 0 && stepIndex <= currentIndex;
                  const isCurrent = stepIndex === currentIndex;

                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            isCompleted
                              ? "border-foreground bg-foreground text-background"
                              : "border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>

                        {index < 2 && (
                          <div
                            className={`mt-1 h-10 w-px ${
                              isCompleted ? "bg-foreground" : "bg-border"
                            }`}
                          />
                        )}
                      </div>

                      <div className="pb-2">
                        <p className="font-medium">{step.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {isCurrent && (
                          <span className="mt-2 inline-block text-xs font-medium">
                            Current status
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Order Items */}
          <section className="rounded-2xl border p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Items</h2>
            </div>

            <div className="divide-y">
              {(Array.isArray(order.items) ? order.items : []).map(
                (item, index) => {
                  const paidQuantity = getPaidQuantity(item);
                  const freeQuantity = getFreeQuantity(item);
                  const totalQuantity = getTotalQuantity(item);
                  const itemPrice = getItemPrice(item);
                  const itemTotal = getItemTotal(item);
                  const dealTitle = getDealTitle(item);

                  return (
                    <div
                      key={item.productId ?? `${item.title}-${index}`}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="shrink-0">
                        <img
                          src={item.image}
                          alt={item.title || "Product"}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{item.title}</h3>

                        {dealTitle && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            <Gift className="h-3.5 w-3.5" />
                            {dealTitle}
                          </div>
                        )}

                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {freeQuantity > 0 ? (
                            <>
                              <p>Paid quantity: {paidQuantity}</p>
                              <p className="flex items-center gap-1.5 font-medium text-foreground">
                                <Gift className="h-3.5 w-3.5" />
                                Free quantity: {freeQuantity}
                              </p>
                              <p>Total quantity: {totalQuantity}</p>
                            </>
                          ) : (
                            <p>Quantity: {paidQuantity}</p>
                          )}
                        </div>

                        <p className="mt-2 font-semibold">₹{itemPrice}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold">₹{itemTotal}</p>
                        {freeQuantity > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {totalQuantity} items
                          </p>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          {/* Delivery Address */}
          <section className="rounded-2xl border p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Delivery Address</h2>
            </div>

            <div className="text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">
                {order.address?.name}
              </p>
              <p>{order.address?.phone}</p>
              <p>
                {order.address?.addressLine1}
                {order.address?.addressLine2 &&
                  `, ${order.address.addressLine2}`}
              </p>
              <p>
                {order.address?.city}, {order.address?.state} -{" "}
                {order.address?.pincode}
              </p>
            </div>
          </section>
        </div>

        {/* Right: order summary */}
        <aside className="h-fit rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>

            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Discount
                  {order.coupon && <> ({order.coupon.code})</>}
                </span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>Free</span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-6 border-t pt-5">
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="mt-1 font-medium uppercase">
              {order.paymentMethod || "N/A"}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default OrderDetails;
