import { useClerk } from "@clerk/react";
import { ArrowLeft, Home, LogOut, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

function Unauthorized() {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="pb-4 text-center">
          {/* Icon */}

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>

          {/* Branding */}

          <p className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground">
            ZANCART ADMIN
          </p>

          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          {/* Message */}

          <p className="text-sm leading-6 text-muted-foreground">
            Your account is not authorized to access the ZanCart Admin Panel.
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If you believe this is a mistake, please contact the store
            administrator.
          </p>

          {/* Actions */}

          <div className="mt-7 flex flex-col gap-3">
            <Button className="w-full" onClick={() => navigate("/login")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>

          {/* Footer */}

          <div className="mt-7 border-t pt-5">
            <p className="text-xs text-muted-foreground">
              ZanCart Administration
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default Unauthorized;
