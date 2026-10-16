import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthContext } from "../context/AuthContext";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(6, "Password must contain at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function Register() {
  const { register: createAccount } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ name, email, password }) => {
    try {
      await createAccount({ name, email, password });
      toast.success("Account created. Please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to create your account.",
      );
    }
  };

  const fieldClass =
    "h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black";

  return (
    <main className="min-h-[calc(100vh-108px)] bg-[#f7f6f2] px-4 py-10 sm:px-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mx-auto w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Join ZanCart and start shopping.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            autoComplete="name"
            {...register("name")}
            className={fieldClass}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
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
            className={fieldClass}
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
            autoComplete="new-password"
            {...register("password")}
            className={fieldClass}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={fieldClass}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-black text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-black underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
