import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  couponCodeExists,
  createCoupon,
} from "@/features/coupons/couponService";

function AddCoupon() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: "",
    expiryDate: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------------------
  // Handle input changes
  // -----------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  // -----------------------------------------
  // Validate form
  // -----------------------------------------

  const validateForm = async () => {
    const newErrors = {};

    const code = formData.code.trim();
    const discountValue = Number(formData.discountValue);
    const minimumOrderAmount = Number(formData.minimumOrderAmount);

    if (!code) {
      newErrors.code = "Coupon code is required.";
    } else if (!/^[A-Z0-9_-]+$/.test(code)) {
      newErrors.code = "Use only letters, numbers, hyphens or underscores.";
    }

    if (!formData.discountType) {
      newErrors.discountType = "Select a discount type.";
    }

    if (formData.discountValue === "" || Number.isNaN(discountValue)) {
      newErrors.discountValue = "Discount value is required.";
    } else if (discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0.";
    } else if (formData.discountType === "percentage" && discountValue > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%.";
    }

    if (
      formData.minimumOrderAmount === "" ||
      Number.isNaN(minimumOrderAmount)
    ) {
      newErrors.minimumOrderAmount = "Minimum order amount is required.";
    } else if (minimumOrderAmount < 0) {
      newErrors.minimumOrderAmount = "Minimum order amount cannot be negative.";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required.";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(`${formData.expiryDate}T00:00:00`);

      if (expiryDate < today) {
        newErrors.expiryDate = "Expiry date cannot be in the past.";
      }
    }

    // Check duplicate coupon code only
    // if the basic code validation passed.
    if (!newErrors.code) {
      try {
        const exists = await couponCodeExists(code);

        if (exists) {
          newErrors.code = "This coupon code already exists.";
        }
      } catch (error) {
        console.error("Failed to check coupon code:", error);

        newErrors.code = "Unable to verify coupon code.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------------------
  // Submit
  // -----------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = await validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);

      const coupon = {
        code: formData.code.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        expiryDate: formData.expiryDate,
        isActive: formData.isActive,
      };

      await createCoupon(coupon);

      navigate("/coupons");
    } catch (error) {
      console.error("Failed to create coupon:", error);

      setErrors({
        submit: "Failed to create coupon. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* -------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------- */}

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/coupons")}
        >
          <ArrowLeft className="size-5" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Coupon</h1>

          <p className="text-muted-foreground">Create a new discount coupon.</p>
        </div>
      </div>

      {/* -------------------------------------- */}
      {/* Form */}
      {/* -------------------------------------- */}

      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon code */}

            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>

              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="WELCOME10"
                maxLength={30}
                autoComplete="off"
              />

              <p className="text-xs text-muted-foreground">
                Customers will enter this code at checkout.
              </p>

              {errors.code && (
                <p className="text-sm text-destructive">{errors.code}</p>
              )}
            </div>

            {/* Discount type */}

            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>

              <select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="percentage">Percentage</option>

                <option value="fixed">Fixed Amount</option>
              </select>

              {errors.discountType && (
                <p className="text-sm text-destructive">
                  {errors.discountType}
                </p>
              )}
            </div>

            {/* Discount value */}

            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>

              <div className="relative">
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={handleChange}
                  placeholder={
                    formData.discountType === "percentage" ? "10" : "200"
                  }
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {formData.discountType === "percentage" ? "%" : "₹"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {formData.discountType === "percentage"
                  ? "Enter a value between 1% and 100%."
                  : "Enter the fixed amount to deduct."}
              </p>

              {errors.discountValue && (
                <p className="text-sm text-destructive">
                  {errors.discountValue}
                </p>
              )}
            </div>

            {/* Minimum order */}

            <div className="space-y-2">
              <Label htmlFor="minimumOrderAmount">Minimum Order Amount</Label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>

                <Input
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumOrderAmount}
                  onChange={handleChange}
                  placeholder="500"
                  className="pl-7"
                />
              </div>

              {errors.minimumOrderAmount && (
                <p className="text-sm text-destructive">
                  {errors.minimumOrderAmount}
                </p>
              )}
            </div>

            {/* Expiry date */}

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>

              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />

              {errors.expiryDate && (
                <p className="text-sm text-destructive">{errors.expiryDate}</p>
              )}
            </div>

            {/* Active */}

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active Coupon
                </Label>

                <p className="mt-1 text-sm text-muted-foreground">
                  Active coupons can be used by customers.
                </p>
              </div>

              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-4 cursor-pointer"
              />
            </div>

            {/* Submit error */}

            {errors.submit && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errors.submit}
              </div>
            )}

            {/* Actions */}

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/coupons")}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 size-4" />

                {submitting ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddCoupon;
