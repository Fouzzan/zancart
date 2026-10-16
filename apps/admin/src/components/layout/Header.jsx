import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logout } from "@/features/auth/authSlice";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { navigation } from "./Sidebar";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.auth);

  const firstName = admin?.name?.split(" ")[0] || "Admin";

  const initials =
    admin?.name
      ?.split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "A";

  const handleLogout = () => {
    setProfileMenuOpen(false);
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    setProfileMenuOpen(false);
    navigate("/profile");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
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

        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <p className="font-semibold">{firstName}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{firstName}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>

          {/* Avatar and dropdown */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              className="flex h-auto items-center gap-1 rounded-full p-1 hover:bg-muted"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <Avatar className="size-9">
                <AvatarImage
                  src={admin?.imageUrl}
                  alt={admin?.name || "Admin"}
                />
                <AvatarFallback>
                  {admin?.name ? initials : <User className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="mr-1 size-4 text-muted-foreground" />
            </Button>

            {profileMenuOpen && (
              <>
                {/* Click outside to close */}
                <button
                  type="button"
                  aria-label="Close account menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setProfileMenuOpen(false)}
                />

                <div
                  role="menu"
                  aria-label="Account menu"
                  className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
                >
                  <div className="border-b px-3 py-2">
                    <p className="truncate text-sm font-medium">
                      {admin?.name || "Admin"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {admin?.email || "Administrator"}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-muted focus-visible:bg-muted"
                  >
                    <User className="size-4" />
                    Profile
                  </button>

                  <Separator className="my-1" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
