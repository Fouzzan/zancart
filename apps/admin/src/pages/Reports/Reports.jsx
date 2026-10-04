import {
  BarChart3,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { getReportsData } from "../../features/reports/reportServices";

// ============================================================
// Helpers
// ============================================================

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

// ============================================================
// Chart Configuration
// ============================================================

const salesChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },

  orders: {
    label: "Orders",
    color: "var(--chart-2)",
  },
};

// ============================================================
// Reports
// ============================================================

function Reports() {
  const [reportData, setReportData] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // Fetch Reports
  // ==========================================================

  const fetchReports = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getReportsData(selectedFilter);

        setReportData(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);

        toast.error("Failed to load reports.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedFilter],
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ==========================================================
  // Loading State
  // ==========================================================

  if (loading) {
    return (
      <main className="space-y-8 p-6">
        <div>
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-[350px] animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </main>
    );
  }

  // ==========================================================
  // Safe Data
  // ==========================================================

  const salesReport = reportData?.salesReport || {};

  const productReport = reportData?.productReport || {};

  const customerReport = reportData?.customerReport || {};

  const salesOverTime = reportData?.salesOverTime || [];

  // ==========================================================
  // Top Products
  // ==========================================================

  const topProducts = (productReport.bestSellingProducts || [])
    .slice(0, 10)
    .map((product) => ({
      ...product,

      title: product.title || product.name || "Unknown Product",

      unitsSold: Number(product.unitsSold) || 0,
    }));

  // ==========================================================
  // Top Customers
  // ==========================================================

  const topCustomers = (customerReport.topCustomersBySpending || [])
    .slice(0, 10)
    .map((customer) => ({
      ...customer,

      name: customer.name || customer.email || "Unknown Customer",

      totalSpent: Number(customer.totalSpent) || 0,

      orderCount: Number(customer.orderCount) || 0,
    }));

  // ==========================================================
  // Filters
  // ==========================================================

  const filters = [
    {
      value: "today",
      label: "Today",
    },

    {
      value: "7days",
      label: "7 Days",
    },

    {
      value: "30days",
      label: "30 Days",
    },

    {
      value: "month",
      label: "This Month",
    },

    {
      value: "all",
      label: "All Time",
    },
  ];

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main className="space-y-8 p-6">
      {/* ======================================================
          Header
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>

          <p className="mt-1 text-muted-foreground">
            Track sales, orders, products, and customer performance.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchReports(true)}
          disabled={refreshing}
          className="w-fit"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* ======================================================
          Date Filters
      ====================================================== */}

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.value)}
            className="rounded-full"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* ======================================================
          KPI Cards
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Revenue */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatCurrency(salesReport.totalRevenue)}
                </p>
              </div>

              <div className="rounded-xl bg-muted p-3">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              From non-cancelled orders
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {salesReport.totalOrders || 0}
                </p>
              </div>

              <div className="rounded-xl bg-muted p-3">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {salesReport.cancelledOrders || 0} cancelled
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatCurrency(salesReport.averageOrderValue)}
                </p>
              </div>

              <div className="rounded-xl bg-muted p-3">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Average revenue per order
            </p>
          </CardContent>
        </Card>

        {/* Active Customers */}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Customers
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {customerReport.activeCustomers || 0}
                </p>
              </div>

              <div className="rounded-xl bg-muted p-3">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Customers with orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          Revenue & Orders Chart
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Revenue & Orders Over Time</CardTitle>

          <p className="text-sm text-muted-foreground">
            Sales performance for the selected period.
          </p>
        </CardHeader>

        <CardContent>
          {salesOverTime.length === 0 ? (
            <div className="flex h-[350px] items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />

                <p className="mt-3 font-medium">No sales data available</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  There are no orders for this period.
                </p>
              </div>
            </div>
          ) : (
            <ChartContainer
              config={salesChartConfig}
              className="h-[350px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={salesOverTime}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatDate}
                />

                <YAxis
                  yAxisId="revenue"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />

                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(`${value}T00:00:00`);

                        return date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />

                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--color-orders)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ======================================================
          Ranked Lists
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ====================================================
            Top Selling Products
        ==================================================== */}

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>

            <p className="text-sm text-muted-foreground">
              Ranked by units sold.
            </p>
          </CardHeader>

          <CardContent>
            {topProducts.length === 0 ? (
              <div className="flex min-h-[350px] items-center justify-center text-center">
                <div>
                  <Package className="mx-auto h-10 w-10 text-muted-foreground" />

                  <p className="mt-3 font-medium">No product sales</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Product sales will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId || product.id || index}
                    className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                  >
                    {/* Rank */}

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Product */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.title}</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.unitsSold}{" "}
                        {product.unitsSold === 1 ? "unit" : "units"} sold
                      </p>
                    </div>

                    {/* Sales */}

                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(
                          product.revenue || product.totalRevenue || 0,
                        )}
                      </p>

                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====================================================
            Top Customers
        ==================================================== */}

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>

            <p className="text-sm text-muted-foreground">
              Ranked by total spending.
            </p>
          </CardHeader>

          <CardContent>
            {topCustomers.length === 0 ? (
              <div className="flex min-h-[350px] items-center justify-center text-center">
                <div>
                  <Users className="mx-auto h-10 w-10 text-muted-foreground" />

                  <p className="mt-3 font-medium">No customer activity</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Customer activity will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.userId || customer.id || index}
                    className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                  >
                    {/* Rank */}

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Customer */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{customer.name}</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {customer.orderCount}{" "}
                        {customer.orderCount === 1 ? "order" : "orders"}
                      </p>
                    </div>

                    {/* Spending */}

                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(customer.totalSpent)}
                      </p>

                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default Reports;
