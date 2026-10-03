import { CalendarDays, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCoupon, getCoupons } from "@/features/coupons/couponService";

function Coupons() {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // -----------------------------------------
  // Fetch coupons
  // -----------------------------------------

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCoupons();

      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);

      setError("Unable to load coupons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // -----------------------------------------
  // Delete coupon
  // -----------------------------------------

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the coupon "${coupon.code}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(coupon.id);
      setError("");

      await deleteCoupon(coupon.id);

      setCoupons((currentCoupons) =>
        currentCoupons.filter((item) => item.id !== coupon.id),
      );
    } catch (error) {
      console.error("Failed to delete coupon:", error);

      setError("Failed to delete coupon. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------------------
  // Format discount
  // -----------------------------------------

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% OFF`;
    }

    return `₹${Number(coupon.discountValue).toLocaleString("en-IN")} OFF`;
  };

  // -----------------------------------------
  // Format date
  // -----------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>

          <p className="text-muted-foreground">
            Manage discount coupons for your store.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading coupons...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* -------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>

          <p className="text-muted-foreground">
            Manage discount coupons for your store.
          </p>
        </div>

        <Button onClick={() => navigate("/coupons/add")}>
          <Plus className="mr-2 size-4" />
          Add Coupon
        </Button>
      </div>

      {/* -------------------------------------- */}
      {/* Error */}
      {/* -------------------------------------- */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* -------------------------------------- */}
      {/* Summary */}
      {/* -------------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
              <Tag className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Coupons</p>

              <p className="text-2xl font-semibold">{coupons.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
              <Tag className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Active Coupons</p>

              <p className="text-2xl font-semibold">
                {coupons.filter((coupon) => coupon.isActive).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
              <CalendarDays className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Inactive Coupons</p>

              <p className="text-2xl font-semibold">
                {coupons.filter((coupon) => !coupon.isActive).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------- */}
      {/* Coupon Table */}
      {/* -------------------------------------- */}

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>

        <CardContent>
          {coupons.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed">
              <Tag className="mb-3 size-8 text-muted-foreground" />

              <p className="font-medium">No coupons found</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first coupon to get started.
              </p>

              <Button className="mt-4" onClick={() => navigate("/coupons/add")}>
                <Plus className="mr-2 size-4" />
                Add Coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Coupon</th>

                    <th className="px-4 py-3 font-medium">Discount</th>

                    <th className="px-4 py-3 font-medium">Minimum Order</th>

                    <th className="px-4 py-3 font-medium">Expiry</th>

                    <th className="px-4 py-3 font-medium">Status</th>

                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b last:border-0">
                      {/* Coupon */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Tag className="size-4 text-muted-foreground" />
                          </div>

                          <div>
                            <p className="font-semibold">{coupon.code}</p>

                            <p className="text-xs text-muted-foreground">
                              ID: {coupon.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-4">
                        <span className="font-medium">
                          {formatDiscount(coupon)}
                        </span>

                        <p className="text-xs text-muted-foreground">
                          {coupon.discountType === "percentage"
                            ? "Percentage"
                            : "Fixed amount"}
                        </p>
                      </td>

                      {/* Minimum order */}
                      <td className="px-4 py-4">
                        ₹
                        {Number(coupon.minimumOrderAmount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="px-4 py-4">
                        {formatDate(coupon.expiryDate)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {coupon.isActive ? (
                          <Badge className="border-0 bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/coupons/edit/${coupon.id}`)
                            }
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={deletingId === coupon.id}
                            onClick={() => handleDelete(coupon)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Coupons;
