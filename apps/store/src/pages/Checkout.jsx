import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const subtotal = items.reduce(
    (total, item) => total + item.discountPrice * item.quantity,
    0,
  );

  const onSubmit = (data) => {
    console.log("Delivery Details:", data);

    navigate("/payment");
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>

        <p className="mt-2 text-muted-foreground">
          Add some products before proceeding to checkout.
        </p>

        <Button
          onClick={() => navigate("/products")}
          className="mt-6 rounded-full"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        {/* Delivery Details */}
        <section className="rounded-2xl border p-6">
          <h2 className="mb-6 text-xl font-semibold">Delivery Details</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <Input
                type="text"
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: "Full name is required",
                })}
              />

              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>

              <Input
                type="tel"
                placeholder="Enter your phone number"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                })}
              />

              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Address</label>

              <Textarea
                placeholder="Enter your delivery address"
                rows={4}
                {...register("address", {
                  required: "Address is required",
                })}
              />

              {errors.address && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">City</label>

                <Input
                  type="text"
                  placeholder="City"
                  {...register("city", {
                    required: "City is required",
                  })}
                />

                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  PIN Code
                </label>

                <Input
                  type="text"
                  placeholder="PIN Code"
                  {...register("pinCode", {
                    required: "PIN code is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "Enter a valid 6-digit PIN code",
                    },
                  })}
                />

                {errors.pinCode && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.pinCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section className="h-fit rounded-2xl border p-6">
          <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>

                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-medium">
                  ₹{item.discountPrice * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="my-6 border-t" />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>

            <span>₹{subtotal}</span>
          </div>

          <div className="mt-3 flex justify-between">
            <span className="text-muted-foreground">Delivery</span>

            <span>Free</span>
          </div>

          <div className="my-4 border-t" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>

          <Button type="submit" className="mt-6 w-full rounded-full">
            Continue to Payment
          </Button>
        </section>
      </form>
    </main>
  );
}

export default Checkout;
