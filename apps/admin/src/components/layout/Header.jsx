import { UserButton, useUser } from "@clerk/react";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

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
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const firstName = user?.firstName || "Admin";

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
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{firstName}</p>

            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>

          <UserButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
