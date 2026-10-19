import {
  BarChart3,
  ClipboardList,
  FolderTree,
  Image,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Tags,
  TicketPercent,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";
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
    label: "Reviews",
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
  const admin = useSelector((state) => state.auth.admin);
  const isSuperAdmin = admin?.role === "superadmin";

  const visibleNavigation = isSuperAdmin
    ? [
        ...navigation,
        {
          label: "Admin Management",
          path: "/admin-management",
          icon: ShieldCheck,
        },
      ]
    : navigation;

  const renderNavigationItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/dashboard" || item.path === "/profile"}
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
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-background lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">ZanCart</h1>
          <p className="text-xs text-muted-foreground">
            {isSuperAdmin ? "Super Admin Panel" : "Admin Panel"}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col p-4">
        {/* <div className="mb-4 space-y-1">
          {renderNavigationItem({
            label: "Profile",
            path: "/profile",
            icon: Users,
          })}
        </div> */}

        <div className="space-y-1">
          {visibleNavigation.map(renderNavigationItem)}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
