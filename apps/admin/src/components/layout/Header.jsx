import { LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "@/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { navigation } from "./Sidebar";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { admin } = useSelector((state) => state.auth);

  const firstName = admin?.name?.split(" ")[0] || "Admin";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-6 py-4 text-left">
              <SheetTitle className="text-xl font-bold">ZanCart</SheetTitle>

              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </SheetHeader>

            <nav className="space-y-1 p-4">
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
          </SheetContent>
        </Sheet>

        {/* Welcome message */}
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>

          <p className="font-semibold">{firstName}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        {/* <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button> */}

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        {/* Admin information */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{firstName}</p>

            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>

          {/* Admin avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <User className="size-4" />
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="size-4" />

            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
