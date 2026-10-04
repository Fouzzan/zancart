import { Button } from "@/components/ui/button";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/redux/slices/cartSlice";
import {
  Gift,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { calculateCartDeals } from "../services/dealCalculationService";

function Cart() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const [calculatedCart, setCalculatedCart] = useState({
    items: [],
    bundles: [],
    subtotal: 0,
    totalDiscount: 0,
    bundleDiscount: 0,
    finalTotal: 0,
  });

  const [isCalculating, setIsCalculating] = useState(false);

  /*
   * -----------------------------------------
   * CALCULATE DEALS
   * -----------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    const calculateDeals = async () => {
      if (items.length === 0) {
        setCalculatedCart({
          items: [],
          bundles: [],
          subtotal: 0,
          totalDiscount: 0,
          bundleDiscount: 0,
          finalTotal: 0,
        });

        return;
      }

      try {
        setIsCalculating(true);

        const result = await calculateCartDeals(items);

        if (!cancelled) {
          setCalculatedCart(result);
        }
      } catch (error) {
        console.error("Failed to calculate deals:", error);

        if (!cancelled) {
          /*
           * If deal calculation fails, fall back
           * to the normal cart prices.
           */
          const fallbackItems = items.map((item) => {
            const quantity = Number(item.quantity) || 0;

            const unitPrice = Number(item.discountPrice) || 0;

            return {
              ...item,
              deal: null,
              originalItemTotal: unitPrice * quantity,
              dealDiscount: 0,
              finalItemTotal: unitPrice * quantity,
              finalUnitPrice: unitPrice,
              freeQuantity: 0,
              paidQuantity: quantity,
              discountPercentage: 0,
            };
          });

          const fallbackTotal = fallbackItems.reduce(
            (total, item) => total + item.finalItemTotal,
            0,
          );

          setCalculatedCart({
            items: fallbackItems,
            bundles: [],
            subtotal: fallbackTotal,
            totalDiscount: 0,
            bundleDiscount: 0,
            finalTotal: fallbackTotal,
          });
        }
      } finally {
        if (!cancelled) {
          setIsCalculating(false);
        }
      }
    };

    calculateDeals();

    return () => {
      cancelled = true;
    };
  }, [items]);

  /*
   * -----------------------------------------
   * REMOVE ITEM
   * -----------------------------------------
   */
  const handleRemove = (id, title) => {
    dispatch(removeFromCart(id));

    toast.success("Removed from cart", {
      description: title,
    });
  };

  /*
   * -----------------------------------------
   * FORMAT MONEY
   * -----------------------------------------
   */
  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  /*
   * -----------------------------------------
   * DEAL LABEL
   * -----------------------------------------
   */
  const getDealLabel = (deal) => {
    if (!deal) {
      return null;
    }

    switch (deal.type) {
      case "flash_sale":
        return deal.title || "Flash Sale";

      case "bogo":
        return deal.title || "Buy 1 Get 1 Free";

      case "quantity_discount":
        return deal.title || "Buy More, Save More";

      case "bundle":
        return deal.title || "Bundle Deal";

      default:
        return deal.title || "Special Offer";
    }
  };

  /*
   * -----------------------------------------
   * EMPTY CART
   * -----------------------------------------
   */
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />

        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>

        <p className="mt-2 text-muted-foreground">
          Looks like you haven't added anything yet.
        </p>

        <Link to="/products">
          <Button className="mt-6 rounded-full px-8">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const calculatedItems =
    calculatedCart.items.length > 0 ? calculatedCart.items : items;

  const subtotal = Number(calculatedCart.subtotal) || 0;

  const totalDiscount = Number(calculatedCart.totalDiscount) || 0;

  const bundleDiscount = Number(calculatedCart.bundleDiscount) || 0;

  const finalTotal = Number(calculatedCart.finalTotal) || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* =========================================
          HEADER
      ========================================== */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {/* Deal calculation indicator */}
      {isCalculating && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Checking available deals...
        </div>
      )}

      {/* =========================================
          MAIN LAYOUT
      ========================================== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* =======================================
            ORDER SUMMARY
        ======================================== */}
        <div className="order-1 lg:order-2">
          <div className="rounded-2xl border bg-background p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-4">
              {/* Product subtotal after product deals */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>

                <span>₹{formatPrice(subtotal)}</span>
              </div>

              {/* Deal savings */}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <Tag className="h-3.5 w-3.5" />
                    Deal savings
                  </span>

                  <span className="font-medium text-green-600">
                    -₹
                    {formatPrice(totalDiscount)}
                  </span>
                </div>
              )}

              {/* Bundle discount */}
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <PackageCheck className="h-3.5 w-3.5" />
                    Bundle savings
                  </span>

                  <span className="font-medium text-green-600">
                    -₹
                    {formatPrice(bundleDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>

                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>₹{formatPrice(finalTotal)}</span>
            </div>

            {/* Total savings message */}
            {totalDiscount > 0 && (
              <div className="mt-4 rounded-xl bg-green-50 p-3 text-center text-sm text-green-700">
                🎉 You're saving ₹{formatPrice(totalDiscount)} on this order!
              </div>
            )}

            <Link to="/checkout" className="block">
              <Button
                type="button"
                disabled={isCalculating}
                className="mt-6 h-12 w-full rounded-xl text-base"
              >
                Proceed to Buy
              </Button>
            </Link>

            <Link
              to="/products"
              className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* =======================================
            CART ITEMS
        ======================================== */}
        <div className="order-2 space-y-4 lg:order-1">
          <h2 className="text-lg font-semibold">Your Items</h2>

          {calculatedItems.map((item) => {
            const deal = item.deal;

            const hasDeal = Boolean(deal) && Number(item.dealDiscount) > 0;

            const freeQuantity = Number(item.freeQuantity) || 0;

            const originalItemTotal =
              Number(item.originalItemTotal) ||
              Number(item.discountPrice) * Number(item.quantity);

            const finalItemTotal =
              Number(item.finalItemTotal) || originalItemTotal;

            return (
              <div key={item.id} className="rounded-2xl border p-4 sm:p-5">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link to={`/products/${item.id}`} className="shrink-0">
                    <img
                      src={item.images?.[0]}
                      alt={item.title}
                      className="h-28 w-28 rounded-xl object-cover sm:h-32 sm:w-32"
                    />
                  </Link>

                  {/* Product Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link
                          to={`/products/${item.id}`}
                          className="font-semibold hover:underline"
                        >
                          {item.title}
                        </Link>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.brand}
                        </p>
                      </div>

                      {/* Remove */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id, item.title)}
                        className="shrink-0 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        ₹{formatPrice(item.discountPrice)}
                      </span>

                      {Number(item.price) > Number(item.discountPrice) && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{formatPrice(item.price)}
                        </span>
                      )}
                    </div>

                    {/* =================================
                        APPLIED DEAL
                    ================================== */}
                    {deal && (
                      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 rounded-full bg-green-100 p-1.5">
                            {deal.type === "bogo" ? (
                              <Gift className="h-4 w-4 text-green-700" />
                            ) : (
                              <Tag className="h-4 w-4 text-green-700" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-green-800">
                              {getDealLabel(deal)}
                            </p>

                            {deal.description && (
                              <p className="mt-0.5 text-xs text-green-700">
                                {deal.description}
                              </p>
                            )}

                            {/* BOGO */}
                            {deal.type === "bogo" && freeQuantity > 0 && (
                              <p className="mt-2 text-xs font-medium text-green-800">
                                🎁 {freeQuantity}{" "}
                                {freeQuantity === 1 ? "item" : "items"} free
                              </p>
                            )}

                            {/* Flash Sale */}
                            {deal.type === "flash_sale" &&
                              item.discountPercentage > 0 && (
                                <p className="mt-2 text-xs font-medium text-green-800">
                                  ⚡ {item.discountPercentage}% off
                                </p>
                              )}

                            {/* Quantity Discount */}
                            {deal.type === "quantity_discount" &&
                              item.discountPercentage > 0 && (
                                <p className="mt-2 text-xs font-medium text-green-800">
                                  📦 {item.discountPercentage}% quantity
                                  discount
                                </p>
                              )}

                            {/* Bundle */}
                            {deal.type === "bundle" && (
                              <p className="mt-2 text-xs font-medium text-green-800">
                                🧩 Bundle price available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* =================================
                        QUANTITY + ITEM TOTAL
                    ================================== */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      {/* Quantity */}
                      <div className="flex items-center rounded-lg border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>

                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => dispatch(increaseQuantity(item.id))}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        {hasDeal && (
                          <p className="text-sm text-muted-foreground line-through">
                            ₹{formatPrice(originalItemTotal)}
                          </p>
                        )}

                        <span className="font-semibold">
                          ₹{formatPrice(finalItemTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Item savings */}
                    {Number(item.dealDiscount) > 0 && (
                      <p className="mt-2 text-right text-xs font-medium text-green-600">
                        You save ₹{formatPrice(item.dealDiscount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* =======================================
              BUNDLE DEALS
          ======================================== */}
          {calculatedCart.bundles?.some((bundle) => bundle.applicable) && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <PackageCheck className="h-5 w-5 text-green-700" />
                </div>

                <div>
                  <h3 className="font-semibold text-green-900">
                    Bundle deal applied 🎉
                  </h3>

                  <div className="mt-2 space-y-2">
                    {calculatedCart.bundles
                      .filter((bundle) => bundle.applicable)
                      .map((bundle) => (
                        <div
                          key={bundle.deal.id}
                          className="text-sm text-green-800"
                        >
                          <p className="font-medium">{bundle.deal.title}</p>

                          <p className="text-xs">
                            Bundle price: ₹{formatPrice(bundle.bundlePrice)}
                            {" • "}
                            You save ₹{formatPrice(bundle.discount)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
