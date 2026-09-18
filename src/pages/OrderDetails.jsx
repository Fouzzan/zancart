import { useUser } from "@clerk/react";
import { ArrowLeft, CheckCircle, MapPin, Package, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
import { cancelOrder, getOrderById } from "../services/orderServices";

function OrderDetails() {
  const { id } = useParams();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);

        // Security check:
        // Users should only see their own orders.
        if (data.userId !== user.id) {
          navigate("/orders");
          return;
        }

        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, isLoaded, navigate]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);

      const updatedOrder = await cancelOrder(order.id);

      setOrder(updatedOrder);
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel the order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (!isLoaded || loading) {
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

  const canCancel = order.status === "placed" || order.status === "confirmed";

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => navigate("/orders")}
        className="-ml-2 mb-6 rounded-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      {/* Header */}
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

                  <AlertDialogAction onClick={handleCancelOrder}>
                    Cancel Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Products */}
          <section className="rounded-2xl border p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Package className="h-5 w-5" />

              <h2 className="text-lg font-semibold">Items</h2>
            </div>

            <div className="divide-y">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{item.title}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-2 font-semibold">₹{item.price}</p>
                  </div>

                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              ))}
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
                {order.address.name}
              </p>

              <p>{order.address.phone}</p>

              <p>
                {order.address.addressLine1}
                {order.address.addressLine2 &&
                  `, ${order.address.addressLine2}`}
              </p>

              <p>
                {order.address.city}, {order.address.state} -{" "}
                {order.address.pincode}
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="h-fit rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span>₹{order.subtotal}</span>
            </div>

            {order.discountAmount > 0 && (
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

            <p className="mt-1 font-medium uppercase">{order.paymentMethod}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default OrderDetails;
