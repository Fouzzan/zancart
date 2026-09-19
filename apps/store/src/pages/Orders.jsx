import { useUser } from "@clerk/react";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "../services/orderServices";

function Orders() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);

        const data = await getUserOrders(user.id);

        // Show newest orders first
        setOrders(
          [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>

        <p className="mt-2 text-muted-foreground">
          View and track your orders.
        </p>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>

          <p className="mt-2 text-muted-foreground">
            Your completed orders will appear here.
          </p>

          <Button
            onClick={() => navigate("/products")}
            className="mt-6 rounded-full"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce(
              (total, item) => total + item.quantity,
              0,
            );

            const orderDate = new Date(order.createdAt).toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            );

            return (
              <div key={order.id} className="rounded-2xl border p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Order info */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold">Order #{order.id}</h2>

                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {orderDate}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                      {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  {/* Price + button */}
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-lg font-bold">₹{order.totalAmount}</p>

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="rounded-full"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Orders;
