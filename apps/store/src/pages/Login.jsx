import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import Image from "../assets/Login/login.png";
import { useAuthContext } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

function Login() {
  const { login, user, isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    try {
      const user = await login(values);

      toast.success("Welcome back!");

      const destination = location.state?.from?.pathname;
      navigate(
        user.role === "admin" ? destination || "/" : destination || "/",
        { replace: true },
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to sign in. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking your session...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-[calc(100vh-108px)] bg-[#f7f6f2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:grid-cols-2">
        <div className="relative hidden min-h-[650px] overflow-hidden bg-[#e9e4da] lg:block">
          <img
            src={Image}
            alt="ZanCart shopping"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 text-white">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em]">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              Everything you want,
              <br />
              all in one place.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">
              Discover products you'll love and enjoy a simpler way to shop.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="w-full max-w-md space-y-6"
          >
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-black">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your details to access your ZanCart account.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-black text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm text-neutral-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-black underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;
