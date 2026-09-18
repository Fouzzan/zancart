import { Button } from "@/components/ui/button";
import { createOrder } from "@/services/orderServices";
import { useUser } from "@clerk/react";
import { ArrowLeft, Banknote, CreditCard, Smartphone } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFromCart } from "../redux/slices/cartSlice";
import { clearCheckout, setPaymentMethod } from "../redux/slices/checkoutSlice";

function Payment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();

  const items = useSelector((state) => state.cart.items);
  const selectedAddress = useSelector(
    (state) => state.checkout.selectedAddress,
  );

  const appliedCoupon = useSelector((state) => state.checkout.coupon);

  const [paymentMethod, setLocalPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const subtotal = items.reduce(
    (total, item) => total + item.discountPrice * item.quantity,
    0,
  );

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.min((subtotal * appliedCoupon.discountValue) / 100, subtotal)
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0;

  const total = subtotal - discountAmount;

  const handlePaymentMethod = (method) => {
    setLocalPaymentMethod(method);
    dispatch(setPaymentMethod(method));
  };

  //   const handlePlaceOrder = async () => {
  //     if (!paymentMethod || !selectedAddress || !user) {
  //       return;
  //     }

  //     try {
  //       const order = {
  //         userId: user.id,

  //         items: items.map((item) => ({
  //           productId: item.id,
  //           title: item.title,
  //           image: item.images[0],
  //           price: item.discountPrice,
  //           quantity: item.quantity,
  //         })),

  //         address: selectedAddress,

  //         paymentMethod,

  //         totalAmount: subtotal,

  //         status: "placed",

  //         createdAt: new Date().toISOString(),
  //       };

  //       const createdOrder = await createOrder(order);

  //       console.log("Order created:", createdOrder);

  //       // Clear cart
  //       items.forEach((item) => {
  //         dispatch(removeFromCart(item.id));
  //       });

  //       // Clear checkout data
  //       dispatch(clearCheckout());

  //       // Go to order confirmation
  //       navigate(`/order-success/${createdOrder.id}`);
  //     } catch (error) {
  //       console.error("Failed to place order:", error);
  //     }
  //   };

  const handleCreateOrder = async () => {
    try {
      const order = {
        userId: user.id,

        items: items.map((item) => ({
          productId: item.id,
          title: item.title,
          image: item.images[0],
          price: item.discountPrice,
          quantity: item.quantity,
        })),

        address: selectedAddress,

        paymentMethod,

        subtotal,

        coupon: appliedCoupon || null,

        discountAmount,

        totalAmount: total,

        status: "placed",

        createdAt: new Date().toISOString(),
      };

      const createdOrder = await createOrder(order);

      console.log("Order created:", createdOrder);

      // Remove all purchased items from cart
      items.forEach((item) => {
        dispatch(removeFromCart(item.id));
      });

      // Clear checkout information
      dispatch(clearCheckout());

      // Go to success page
      navigate(`/order-success/${createdOrder.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);

      setIsProcessing(false);
      alert("Failed to place order. Please try again.");
    }
  };

  const handlePlaceOrder = () => {
    if (!paymentMethod) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      handleCreateOrder();
    }, 2000);
  };

  // Prevent accessing payment without checkout data
  if (!selectedAddress || items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Checkout information missing</h1>

        <p className="mt-2 text-muted-foreground">
          Please return to checkout and select a delivery address.
        </p>

        <Button
          onClick={() => navigate("/checkout")}
          className="mt-6 rounded-full"
        >
          Back to Checkout
        </Button>
      </div>
    );
  }

  //   if (paymentSuccess) {
  //     return (
  //       <main className="flex min-h-[70vh] items-center justify-center px-4">
  //         <div className="w-full max-w-md text-center">
  //           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
  //             ✓
  //           </div>

  //           <h1 className="mt-6 text-3xl font-bold">Payment Successful</h1>

  //           <p className="mt-3 text-muted-foreground">
  //             Your payment has been processed successfully.
  //           </p>

  //           <p className="mt-4 text-lg font-semibold">₹{total}</p>

  //           <Button
  //             onClick={() => {
  //               // Order creation will be connected here next
  //               navigate("/order-success");
  //             }}
  //             className="mt-8 w-full rounded-full"
  //           >
  //             Continue
  //           </Button>
  //         </div>
  //       </main>
  //     );
  //   }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => navigate("/checkout")}
        className="mb-6 -ml-2 rounded-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Checkout
      </Button>

      <h1 className="mb-8 text-3xl font-bold">Payment</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Payment Methods */}
        <section className="rounded-2xl border p-6">
          <h2 className="mb-2 text-xl font-semibold">Choose Payment Method</h2>

          <p className="mb-6 text-sm text-muted-foreground">
            Select how you would like to pay.
          </p>

          <div className="space-y-3">
            {/* COD */}
            <button
              type="button"
              onClick={() => handlePaymentMethod("cod")}
              className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                paymentMethod === "cod"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Banknote className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <p className="font-semibold">Cash on Delivery</p>

                <p className="text-sm text-muted-foreground">
                  Pay when your order arrives.
                </p>
              </div>

              <div
                className={`h-5 w-5 rounded-full border ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                }`}
              />
            </button>

            {/* UPI */}
            <button
              type="button"
              onClick={() => handlePaymentMethod("upi")}
              className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                paymentMethod === "upi"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Smartphone className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <p className="font-semibold">UPI</p>

                <p className="text-sm text-muted-foreground">
                  Pay using your UPI app.
                </p>
              </div>

              <div
                className={`h-5 w-5 rounded-full border ${
                  paymentMethod === "upi"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                }`}
              />
            </button>

            {/* Card */}
            <button
              type="button"
              onClick={() => handlePaymentMethod("card")}
              className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <p className="font-semibold">Credit / Debit Card</p>

                <p className="text-sm text-muted-foreground">
                  Pay securely using your card.
                </p>
              </div>

              <div
                className={`h-5 w-5 rounded-full border ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                }`}
              />
            </button>
          </div>

          {/* Selected address */}
          <div className="mt-8 rounded-2xl bg-muted/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Delivery Address</h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/checkout")}
                className="rounded-full"
              >
                Change
              </Button>
            </div>

            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {selectedAddress.fullName}
              </p>

              <p>{selectedAddress.phone}</p>

              <p>{selectedAddress.address}</p>

              <p>
                {selectedAddress.city} - {selectedAddress.pinCode}
              </p>
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

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span>₹{subtotal}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Discount ({appliedCoupon.code})
                </span>

                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>

              <span>Free</span>
            </div>
          </div>

          <div className="my-4 border-t" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>

            <span>₹{total}</span>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={!paymentMethod || isProcessing}
            className="mt-6 w-full rounded-full"
          >
            {isProcessing ? "Processing Payment..." : "Place Order"}
          </Button>
        </section>
      </div>
    </main>
  );
}

export default Payment;
