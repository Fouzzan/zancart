import { useUser } from "@clerk/react";
import { Check, MapPin, Plus, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { setCoupon, setSelectedAddress } from "../redux/slices/checkoutSlice";
import { getUserAddresses } from "../services/addressServices";
import { getCouponByCode } from "../services/couponServices";

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoaded } = useUser();

  const items = useSelector((state) => state.cart.items);

  const selectedAddress = useSelector(
    (state) => state.checkout.selectedAddress,
  );

  const appliedCoupon = useSelector((state) => state.checkout.coupon);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce(
    (total, item) => total + item.discountPrice * item.quantity,
    0,
  );

  // Calculate discount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === "percentage") {
      return Math.min((subtotal * appliedCoupon.discountValue) / 100, subtotal);
    }

    if (appliedCoupon.discountType === "fixed") {
      return Math.min(appliedCoupon.discountValue, subtotal);
    }

    return 0;
  };

  const discountAmount = getDiscountAmount();

  const total = subtotal - discountAmount;

  // Fetch addresses
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchAddresses = async () => {
      try {
        setLoading(true);

        const data = await getUserAddresses(user.id);

        setAddresses(data);

        const defaultAddress = data.find((address) => address.isDefault);

        if (defaultAddress) {
          dispatch(setSelectedAddress(defaultAddress));
        } else if (data.length > 0 && !selectedAddress) {
          dispatch(setSelectedAddress(data[0]));
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user, isLoaded, dispatch]);

  // Apply coupon
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      const coupon = await getCouponByCode(code);

      // Coupon doesn't exist
      if (!coupon) {
        dispatch(setCoupon(null));
        setCouponError("Invalid coupon code.");
        return;
      }

      // Coupon is inactive
      if (!coupon.isActive) {
        dispatch(setCoupon(null));
        setCouponError("This coupon is no longer active.");
        return;
      }

      // Coupon expired
      const today = new Date().toISOString().split("T")[0];

      if (coupon.expiryDate < today) {
        dispatch(setCoupon(null));
        setCouponError("This coupon has expired.");
        return;
      }

      // Minimum order validation
      if (subtotal < coupon.minimumOrderAmount) {
        dispatch(setCoupon(null));
        setCouponError(
          `Minimum order amount is ₹${coupon.minimumOrderAmount}.`,
        );
        return;
      }

      // Coupon is valid
      dispatch(setCoupon(coupon));
      setCouponError("");
      setCouponCode(coupon.code);
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      setCouponError("Unable to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    dispatch(setCoupon(null));
    setCouponCode("");
    setCouponError("");
  };

  const handleSelectAddress = (address) => {
    dispatch(setSelectedAddress(address));
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) return;

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

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Delivery Address */}
        <section className="rounded-2xl border p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Delivery Address</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Select where you want your order delivered.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/addresses")}
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">No saved addresses</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a delivery address before continuing.
              </p>

              <Button
                onClick={() => navigate("/addresses")}
                className="mt-5 rounded-full"
              >
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => {
                const isSelected = selectedAddress?.id === address.id;

                return (
                  <button
                    type="button"
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className={`w-full rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{address.fullName}</h3>

                          {address.isDefault && (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>{address.phone}</p>
                          <p>{address.address}</p>
                          <p>
                            {address.city} - {address.pinCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              <Button
                variant="outline"
                onClick={() => navigate("/addresses")}
                className="w-full rounded-full"
              >
                Manage Addresses
              </Button>
            </div>
          )}
        </section>

        {/* Order Summary */}
        <section className="h-fit rounded-2xl border p-6">
          <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

          {/* Products */}
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

          {/* Coupon */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />

              <h3 className="font-medium">Apply Coupon</h3>
            </div>

            {!appliedCoupon ? (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  placeholder="Enter coupon code"
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="rounded-full"
                >
                  {couponLoading ? "Checking..." : "Apply"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3">
                <div>
                  <p className="text-sm font-semibold">{appliedCoupon.code}</p>

                  <p className="text-xs text-muted-foreground">
                    {appliedCoupon.discountType === "percentage"
                      ? `${appliedCoupon.discountValue}% discount`
                      : `₹${appliedCoupon.discountValue} discount`}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="rounded-full"
                >
                  <X className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}

            {couponError && (
              <p className="mt-2 text-sm text-red-500">{couponError}</p>
            )}

            {appliedCoupon && !couponError && (
              <p className="mt-2 text-sm">✓ Coupon applied successfully</p>
            )}
          </div>

          <div className="my-6 border-t" />

          {/* Price Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span>₹{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>

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
            onClick={handleContinueToPayment}
            disabled={!selectedAddress}
            className="mt-6 w-full rounded-full"
          >
            Continue to Payment
          </Button>
        </section>
      </div>
    </main>
  );
}

export default Checkout;
