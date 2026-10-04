import {
  ArrowUpRight,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import api from "../../services/api";

// ============================================================
// Helpers
// ============================================================

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

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

const getCustomerName = (order) => {
  return (
    order?.address?.fullName ||
    order?.userName ||
    order?.userEmail ||
    order?.userId ||
    "Unknown customer"
  );
};

// ============================================================
// Dashboard
// ============================================================

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    products: [],
    users: [],
    coupons: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // Fetch Dashboard Data
  // ==========================================================

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [ordersResponse, productsResponse, usersResponse, couponsResponse] =
        await Promise.all([
          api.get("/orders"),
          api.get("/products"),
          api.get("/users"),
          api.get("/coupons"),
        ]);

      setDashboardData({
        orders: Array.isArray(ordersResponse.data) ? ordersResponse.data : [],

        products: Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [],

        users: Array.isArray(usersResponse.data) ? usersResponse.data : [],

        coupons: Array.isArray(couponsResponse.data)
          ? couponsResponse.data
          : [],
      });
    } catch (error) {
      console.error("Failed to load dashboard:", error);

      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // Initial Load
  // ==========================================================

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ==========================================================
  // Derived Data
  // ==========================================================

  const { orders, products, users, coupons } = dashboardData;

  // ----------------------------------------------------------
  // Non-cancelled orders
  // ----------------------------------------------------------

  const validOrders = orders.filter((order) => order.status !== "cancelled");

  // ----------------------------------------------------------
  // Revenue
  // ----------------------------------------------------------

  const totalRevenue = validOrders.reduce((total, order) => {
    return total + Number(order.totalAmount || 0);
  }, 0);

  // ----------------------------------------------------------
  // Recent orders
  // ----------------------------------------------------------

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  // ----------------------------------------------------------
  // Statistics
  // ----------------------------------------------------------

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: `${validOrders.length} completed/active orders`,
      icon: DollarSign,
    },

    {
      title: "Orders",
      value: orders.length.toLocaleString("en-IN"),
      description:
        orders.length === 1
          ? "1 order placed"
          : `${orders.length} orders placed`,
      icon: ShoppingCart,
    },

    {
      title: "Products",
      value: products.length.toLocaleString("en-IN"),
      description:
        products.length === 1
          ? "1 product in catalog"
          : `${products.length} products in catalog`,
      icon: Package,
    },

    {
      title: "Customers",
      value: users.length.toLocaleString("en-IN"),
      description:
        users.length === 1
          ? "1 registered customer"
          : `${users.length} registered customers`,
      icon: Users,
    },
  ];

  // ==========================================================
  // Loading State
  // ==========================================================

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />

            <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        {/* Stats */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom cards */}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="h-60 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="h-60 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="space-y-8">
      {/* ======================================================
          Page Header
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

          <p className="mt-1 text-muted-foreground">
            Overview of your ZanCart store.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-2 size-4 ${refreshing ? "animate-spin" : ""}`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* ======================================================
          Statistics
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>

                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ======================================================
          Recent Orders + Quick Overview
      ====================================================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ====================================================
            Recent Orders
        ==================================================== */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Latest customer orders.
              </p>
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">
                View all
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-3 size-8 text-muted-foreground" />

                <p className="font-medium">No orders yet</p>

                <p className="text-sm text-muted-foreground">
                  Orders will appear here once customers start purchasing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const isCancelled = order.status === "cancelled";

                  return (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="block rounded-xl border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            Order #{order.id}
                          </p>

                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {getCustomerName(order)}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                              isCancelled
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {order.status || "unknown"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====================================================
            Quick Overview
        ==================================================== */}

        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Store management at a glance.
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {/* Products */}

              <Link
                to="/products"
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Package className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Products</p>

                    <p className="text-xs text-muted-foreground">
                      Manage product catalog
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">{products.length}</span>

                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              </Link>

              {/* Orders */}

              <Link
                to="/orders"
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <ShoppingCart className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Orders</p>

                    <p className="text-xs text-muted-foreground">
                      View and manage orders
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">{orders.length}</span>

                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              </Link>

              {/* Customers */}

              <Link
                to="/users"
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Users className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Customers</p>

                    <p className="text-xs text-muted-foreground">
                      Manage registered customers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">{users.length}</span>

                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              </Link>

              {/* Coupons */}

              <Link
                to="/coupons"
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Package className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Coupons</p>

                    <p className="text-xs text-muted-foreground">
                      Manage promotional coupons
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold">{coupons.length}</span>

                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
