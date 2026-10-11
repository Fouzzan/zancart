import { CheckCircle2, ShieldCheck, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "@/features/auth/authSlice";

import { loginAdmin } from "@/features/auth/authServices";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    dispatch(loginStart());

    try {
      const data = await loginAdmin(email, password);

      // Admin-only check
      if (data.user?.role !== "admin") {
        throw new Error("Admin access required.");
      }

      // Store authentication data
      localStorage.setItem("adminToken", data.token);

      localStorage.setItem("adminUser", JSON.stringify(data.user));

      // Update Redux
      dispatch(
        loginSuccess({
          token: data.token,
          admin: data.user,
        }),
      );

      // Go to dashboard
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin login failed:", error);

      dispatch(
        loginFailure(
          error.response?.data?.message || error.message || "Unable to login.",
        ),
      );
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ==================================================
            Brand Section
        ================================================== */}

        <section className="relative hidden overflow-hidden bg-background lg:flex">
          <div className="flex w-full flex-col justify-between p-10 xl:p-16">
            {/* Brand */}

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <ShoppingBag className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-lg font-bold tracking-tight">ZanCart</p>

                  <p className="text-xs text-muted-foreground">
                    Administration
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Admin Portal
              </div>

              <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
                Manage your store
                <span className="block text-muted-foreground">
                  from one place.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Manage products, orders, customers, deals, coupons, and store
                performance through the ZanCart administration panel.
              </p>

              {/* Features */}

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">Manage products and inventory</span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">Track orders and customers</span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />

                  <span className="text-sm">
                    Monitor sales and store reports
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}

            <p className="text-xs text-muted-foreground">
              ZanCart Administration Panel
            </p>
          </div>
        </section>

        {/* ==================================================
            Login Section
        ================================================== */}

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}

            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShoppingBag className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                ZanCart Admin
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Administration Portal
              </p>
            </div>

            {/* Login Heading */}

            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to access your admin dashboard.
              </p>
            </div>

            {/* ==================================================
                Custom Login Form
            ================================================== */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@zancart.com"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2"
                />
              </div>

              {/* Password */}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2"
                />
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Security Note */}

            <div className="mt-8 flex items-start gap-3 rounded-xl border bg-background p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                This portal is restricted to authorized ZanCart administrators.
                Unauthorized accounts will not be granted access.
              </p>
            </div>

            {/* Mobile Footer */}

            <p className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
              ZanCart Administration Panel
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
