import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  reduceOrderStock,
  restoreOrderStock,
} from "@/services/productServices";
import { clearCart } from "../redux/slices/cartSlice";
import { calculateCartDeals } from "../services/dealCalculationService";
import { createOrder } from "../services/orderServices";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);

  const { address, coupon, discountAmount = 0 } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);

  const [dealCalculation, setDealCalculation] = useState(null);
  const [isCalculatingDeals, setIsCalculatingDeals] = useState(true);

  // --------------------------------------------------
  // Calculate deals when Payment loads
  // --------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const calculateDeals = async () => {
      if (!items || items.length === 0) {
        setDealCalculation(null);
        setIsCalculatingDeals(false);
        return;
      }

      try {
        setIsCalculatingDeals(true);

        const result = await calculateCartDeals(items);

        if (!cancelled) {
          setDealCalculation(result);
        }
      } catch (error) {
        console.error("Failed to calculate deals:", error);

        if (!cancelled) {
          toast.error("Unable to calculate the latest deals.");
        }
      } finally {
        if (!cancelled) {
          setIsCalculatingDeals(false);
        }
      }
    };

    calculateDeals();

    return () => {
      cancelled = true;
    };
  }, [items]);

  // --------------------------------------------------
  // Latest calculated values
  // --------------------------------------------------
  const latestDealCalculation = dealCalculation;

  const subtotal = Number(latestDealCalculation?.subtotal || 0);

  const dealDiscount = Number(latestDealCalculation?.totalDiscount || 0);

  const bundleDiscount = Number(latestDealCalculation?.bundleDiscount || 0);

  const couponDiscount = Number(discountAmount || 0);

  const totalAmount = Math.max(0, subtotal - dealDiscount - couponDiscount);

  // --------------------------------------------------
  // Create order
  // --------------------------------------------------
  const handleCreateOrder = async () => {
    if (isProcessing) {
      return;
    }

    if (!address) {
      toast.error("Please select a delivery address.");
      navigate("/checkout");
      return;
    }

    if (!items || items.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/products");
      return;
    }

    if (!latestDealCalculation || isCalculatingDeals) {
      toast.error("Please wait while we calculate the latest deals.");
      return;
    }

    setIsProcessing(true);

    let stockUpdates = [];

    try {
      // --------------------------------------------------
      // Recalculate deals immediately before order creation.
      //
      // This prevents stale deal information from being used
      // if a deal expired or changed while the user was on
      // the payment page.
      // --------------------------------------------------
      const finalDealCalculation = await calculateCartDeals(items);

      // --------------------------------------------------
      // Build order items
      //
      // IMPORTANT:
      // quantity = total physical quantity leaving inventory.
      //
      // For BOGO:
      // quantity = paidQuantity + freeQuantity
      //
      // Example:
      // paidQuantity = 1
      // freeQuantity = 1
      // quantity = 2
      // --------------------------------------------------
      const orderItems = finalDealCalculation.items.map((item) => {
        const quantity = Number(item.quantity) || 0;

        const freeQuantity = Number(item.freeQuantity) || 0;

        const paidQuantity = Number(
          item.paidQuantity ?? quantity - freeQuantity,
        );

        return {
          productId: item.id,
          title: item.title,
          image: item.images?.[0] || "",

          price: Number(item.discountPrice || 0),

          // Total physical quantity being purchased/fulfilled.
          quantity,

          // Deal information.
          deal: item.deal || null,

          dealDiscount: Number(item.dealDiscount || 0),

          originalItemTotal: Number(item.originalItemTotal || 0),

          finalItemTotal: Number(item.finalItemTotal || 0),

          finalUnitPrice: Number(item.finalUnitPrice || 0),

          // BOGO / free-item information.
          freeQuantity,
          paidQuantity,

          discountPercentage: Number(item.discountPercentage || 0),

          appliedTier: item.appliedTier || null,
        };
      });

      // --------------------------------------------------
      // Product-level deals
      // --------------------------------------------------
      const productDeals = finalDealCalculation.items
        .filter((item) => item.deal && item.deal.type !== "bundle")
        .map((item) => ({
          productId: item.id,

          dealId: item.deal.id,
          title: item.deal.title,
          type: item.deal.type,

          discount: Number(item.dealDiscount || 0),

          quantity: Number(item.quantity || 0),

          freeQuantity: Number(item.freeQuantity || 0),

          paidQuantity: Number(
            item.paidQuantity ??
              Math.max(
                0,
                Number(item.quantity || 0) - Number(item.freeQuantity || 0),
              ),
          ),
        }));

      // --------------------------------------------------
      // Bundle deals
      //
      // We store the bundle information for order details
      // and admin views.
      //
      // We DO NOT deduct bundle stock separately because
      // orderItems already contain the physical product
      // quantities that need to leave inventory.
      // --------------------------------------------------
      const appliedBundles =
        finalDealCalculation.bundles
          ?.filter((bundle) => bundle.applicable)
          .map((bundle) => ({
            dealId: bundle.deal.id,

            title: bundle.deal.title,

            type: bundle.deal.type,

            bundlePrice: Number(bundle.bundlePrice || 0),

            originalPrice: Number(bundle.originalPrice || 0),

            discount: Number(bundle.discount || 0),

            // Number of complete bundles.
            bundleQuantity: Number(bundle.bundleQuantity || 0),

            // IDs of products included.
            productIds: bundle.deal.products || [],

            // Exact quantities consumed by bundles.
            productQuantities: bundle.productQuantities || [],
          })) || [];

      // --------------------------------------------------
      // Applied deals object
      // --------------------------------------------------
      const appliedDeals = {
        productDeals,

        bundles: appliedBundles,

        subtotal: Number(finalDealCalculation.subtotal || 0),

        totalDiscount: Number(finalDealCalculation.totalDiscount || 0),

        bundleDiscount: Number(finalDealCalculation.bundleDiscount || 0),

        finalTotal: Number(
          finalDealCalculation.finalTotal ||
            Math.max(
              0,
              Number(finalDealCalculation.subtotal || 0) -
                Number(finalDealCalculation.totalDiscount || 0),
            ),
        ),
      };

      // --------------------------------------------------
      // Reduce stock
      //
      // IMPORTANT:
      // productServices.js already determines the physical
      // quantity to deduct using:
      //
      // paidQuantity + freeQuantity
      //
      // Therefore we only pass orderItems.
      //
      // We do NOT separately deduct bundle quantities.
      // --------------------------------------------------
      stockUpdates = await reduceOrderStock(orderItems);

      // --------------------------------------------------
      // Final pricing
      //
      // Recalculate from the FINAL deal calculation rather
      // than the potentially stale value from the first render.
      // --------------------------------------------------
      const finalSubtotal = Number(finalDealCalculation.subtotal || 0);

      const finalDealDiscount = Number(finalDealCalculation.totalDiscount || 0);

      const finalBundleDiscount = Number(
        finalDealCalculation.bundleDiscount || 0,
      );

      const finalCouponDiscount = Number(couponDiscount || 0);

      const finalTotalAmount = Math.max(
        0,
        finalSubtotal - finalDealDiscount - finalCouponDiscount,
      );

      // --------------------------------------------------
      // Create order
      // --------------------------------------------------
      const order = {
        userId: localStorage.getItem("userId") || "guest",

        items: orderItems,

        appliedDeals,

        address,

        paymentMethod,

        coupon: coupon || null,

        discountAmount: finalCouponDiscount,

        dealDiscount: finalDealDiscount,

        bundleDiscount: finalBundleDiscount,

        subtotal: finalSubtotal,

        totalAmount: finalTotalAmount,

        status: "placed",

        createdAt: new Date().toISOString(),
      };

      const createdOrder = await createOrder(order);

      // --------------------------------------------------
      // Clear cart ONLY after order succeeds.
      // --------------------------------------------------
      dispatch(clearCart());

      toast.success("Order placed successfully!");

      navigate(`/orders/${createdOrder.id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Order creation failed:", error);

      // --------------------------------------------------
      // Restore stock if stock was already reduced but
      // order creation failed.
      // --------------------------------------------------
      if (stockUpdates && stockUpdates.length > 0) {
        try {
          await restoreOrderStock(stockUpdates);
        } catch (restoreError) {
          console.error("Failed to restore stock:", restoreError);
        }
      }

      toast.error(error?.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------
  if (!address || isCalculatingDeals || !latestDealCalculation) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />

          <p className="mt-4 text-sm text-muted-foreground">
            Calculating your latest deals...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          type="button"
          variant="ghost"
          className="mb-4 -ml-3"
          onClick={() => navigate("/checkout")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checkout
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Payment</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review your order and choose your payment method.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ==========================================
            LEFT SIDE
        =========================================== */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <div className="rounded-2xl border bg-background p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5" />

              <h2 className="text-lg font-semibold">Delivery Address</h2>
            </div>

            <div className="mt-4 rounded-xl border bg-muted/30 p-4">
              <p className="font-medium">{address.name}</p>

              <p className="mt-1 text-sm text-muted-foreground">
                {address.phone}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {address.address}
              </p>

              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} {address.pincode}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-2xl border bg-background p-6">
            <h2 className="text-lg font-semibold">Payment Method</h2>

            <div className="mt-4 space-y-3">
              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  paymentMethod === "cod"
                    ? "border-foreground bg-muted/40"
                    : "hover:bg-muted/20"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                  <WalletCards className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">Cash on Delivery</p>

                  <p className="text-sm text-muted-foreground">
                    Pay when your order arrives.
                  </p>
                </div>

                {paymentMethod === "cod" && (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  paymentMethod === "card"
                    ? "border-foreground bg-muted/40"
                    : "hover:bg-muted/20"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                  <CreditCard className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">Credit / Debit Card</p>

                  <p className="text-sm text-muted-foreground">
                    Secure card payment.
                  </p>
                </div>

                {paymentMethod === "card" && (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </button>

              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  paymentMethod === "upi"
                    ? "border-foreground bg-muted/40"
                    : "hover:bg-muted/20"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                  <Smartphone className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">UPI</p>

                  <p className="text-sm text-muted-foreground">
                    Pay using your UPI app.
                  </p>
                </div>

                {paymentMethod === "upi" && (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-medium">Secure Checkout</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Your order information is securely processed.
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT SIDE
        =========================================== */}
        <div>
          <div className="rounded-2xl border bg-background p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5" />

              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>

            {/* Items */}
            <div className="mt-6 space-y-4">
              {latestDealCalculation.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.images?.[0]}
                    alt={item.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>

                    {/* BOGO */}
                    {item.freeQuantity > 0 && (
                      <p className="mt-1 text-xs font-medium text-green-600">
                        {item.paidQuantity} paid + {item.freeQuantity} free
                      </p>
                    )}

                    {/* Other deals */}
                    {item.deal && item.freeQuantity === 0 && (
                      <p className="mt-1 text-xs font-medium text-green-600">
                        {item.deal.title}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ₹{Number(item.finalItemTotal || 0).toFixed(2)}
                    </p>

                    {item.dealDiscount > 0 && (
                      <p className="text-xs text-green-600">
                        -₹
                        {Number(item.dealDiscount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bundles */}
            {latestDealCalculation.bundles
              ?.filter((bundle) => bundle.applicable)
              .map((bundle) => (
                <div
                  key={bundle.deal.id}
                  className="mt-5 rounded-xl border bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {bundle.deal.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {bundle.bundleQuantity} bundle
                        {bundle.bundleQuantity !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <p className="text-sm font-semibold">
                      -₹
                      {Number(bundle.discount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

            {/* Price Summary */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>

                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {dealDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deal Discount</span>

                  <span className="text-green-600">
                    -₹{dealDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coupon Discount</span>

                  <span className="text-green-600">
                    -₹{couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>

                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>

              <span>₹{totalAmount.toFixed(2)}</span>
            </div>

            <Button
              type="button"
              disabled={isProcessing || isCalculatingDeals}
              onClick={handleCreateOrder}
              className="mt-6 h-12 w-full rounded-xl text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
