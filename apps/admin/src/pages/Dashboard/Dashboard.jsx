import {
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Revenue",
    value: "₹0",
    description: "No sales data yet",
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "0",
    description: "No orders yet",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    value: "0",
    description: "No products yet",
    icon: Package,
  },
  {
    title: "Customers",
    value: "0",
    description: "No customers yet",
    icon: Users,
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

          <p className="mt-1 text-muted-foreground">
            Overview of your ZanCart store.
          </p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <ShoppingCart className="mb-3 size-8 text-muted-foreground" />

              <p className="font-medium">No orders yet</p>

              <p className="text-sm text-muted-foreground">
                Orders will appear here once customers start purchasing.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {["Products", "Orders", "Customers", "Coupons"].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm">{item}</span>

                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
