import { UserButton, useUser } from "@clerk/react";
import { Bell } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function Header() {
  const { user } = useUser();

  const firstName = user?.firstName || "Admin";

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "A";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>

        <p className="font-semibold">{firstName}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={user?.imageUrl} alt={firstName} />

            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

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
