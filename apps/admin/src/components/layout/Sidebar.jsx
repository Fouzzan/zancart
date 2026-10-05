import {
  BarChart3,
  Boxes,
  ClipboardList,
  FolderTree,
  Image,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Tag,
  Tags,
  TicketPercent,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    path: "/products",
    icon: ShoppingBag,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Boxes,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: FolderTree,
  },
  {
    label: "Brands",
    path: "/brands",
    icon: Tags,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ClipboardList,
  },
  {
    label: "Deals",
    path: "/deals",
    icon: Tag,
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
  },
  {
    label: "Coupons",
    path: "/coupons",
    icon: TicketPercent,
  },
  {
    label: "reviews",
    path: "/reviews",
    icon: MessageSquare,
  },
  {
    label: "Banners",
    path: "/banners",
    icon: Image,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
];

function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-background lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">ZanCart</h1>

          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-3">
          <Boxes className="size-4 text-muted-foreground" />

          <div>
            <p className="text-sm font-medium">ZanCart</p>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
