import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { getDealById, updateDeal } from "../../features/deals/dealServices";
import api from "../../services/api";

const ITEMS_PER_PAGE = 12;

const DEFAULT_TIERS = [
  {
    quantity: 2,
    discount: 10,
  },
];

const INITIAL_FORM = {
  title: "",
  description: "",
  type: "flash_sale",
  products: [],
  discountValue: "",
  tiers: DEFAULT_TIERS,
  bundlePrice: "",
  priority: 1,
  startDate: "",
  endDate: "",
  isActive: true,
};

// ============================================================
// Convert stored ISO date → datetime-local value
// ============================================================
const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

// ============================================================
// Convert datetime-local → ISO
// ============================================================
const toISOStringOrNull = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

function EditDeals() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================================
  // Pagination
  // ==========================================================
  const [currentPage, setCurrentPage] = useState(1);

  // ==========================================================
  // Fetch deal + products
  // ==========================================================
  useEffect(() => {
    if (!id) {
      toast.error("Deal ID is missing.");
      navigate("/deals");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingProducts(true);

        const [dealData, productsResponse] = await Promise.all([
          getDealById(id),
          api.get("/products"),
        ]);

        const productData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];

        setProducts(productData);

        // ------------------------------------------------------
        // Normalize existing deal
        // ------------------------------------------------------
        const normalizedProducts = Array.isArray(dealData.products)
          ? dealData.products.map(String)
          : [];

        const normalizedTiers =
          Array.isArray(dealData.tiers) && dealData.tiers.length > 0
            ? dealData.tiers.map((tier) => ({
                quantity: Number(tier.quantity),
                discount: Number(tier.discount),
              }))
            : DEFAULT_TIERS;

        setForm({
          title: dealData.title ?? "",
          description: dealData.description ?? "",
          type: dealData.type ?? "flash_sale",
          products: normalizedProducts,
          discountValue: dealData.discountValue ?? "",
          tiers: normalizedTiers,
          bundlePrice: dealData.bundlePrice ?? "",
          priority: dealData.priority ?? 1,
          startDate: toDateTimeLocal(dealData.startDate),
          endDate: toDateTimeLocal(dealData.endDate),
          isActive: dealData.isActive !== false,
        });
      } catch (error) {
        console.error("Failed to load deal:", error);

        toast.error("Failed to load deal.");
        navigate("/deals");
      } finally {
        setLoading(false);
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // ==========================================================
  // Generic field change
  // ==========================================================
  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // Product selection
  // ==========================================================
  const toggleProduct = (productId) => {
    setForm((previous) => {
      const normalizedId = String(productId);

      const exists = previous.products.some(
        (id) => String(id) === normalizedId,
      );

      if (exists) {
        return {
          ...previous,
          products: previous.products.filter(
            (id) => String(id) !== normalizedId,
          ),
        };
      }

      return {
        ...previous,
        products: [...previous.products, normalizedId],
      };
    });
  };

  // ==========================================================
  // Pagination calculations
  // ==========================================================
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  // ==========================================================
  // Reset pagination when products change
  // ==========================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // ==========================================================
  // Keep current page valid
  // ==========================================================
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ==========================================================
  // Quantity discount tiers
  // ==========================================================
  const addTier = () => {
    setForm((previous) => {
      const highestQuantity = previous.tiers.reduce(
        (highest, tier) => Math.max(highest, Number(tier.quantity) || 0),
        0,
      );

      return {
        ...previous,
        tiers: [
          ...previous.tiers,
          {
            quantity: highestQuantity + 1,
            discount: 10,
          },
        ],
      };
    });
  };

  const removeTier = (index) => {
    setForm((previous) => ({
      ...previous,
      tiers: previous.tiers.filter((_, tierIndex) => tierIndex !== index),
    }));
  };

  const updateTier = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      tiers: previous.tiers.map((tier, tierIndex) =>
        tierIndex === index
          ? {
              ...tier,
              [field]: value,
            }
          : tier,
      ),
    }));
  };

  // ==========================================================
  // Validation
  // ==========================================================
  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a deal title.");
      return false;
    }

    if (!form.type) {
      toast.error("Please select a deal type.");
      return false;
    }

    if (form.products.length === 0) {
      toast.error("Please select at least one product.");
      return false;
    }

    const priority = Number(form.priority);

    if (!Number.isInteger(priority) || priority < 1) {
      toast.error("Priority must be a positive whole number.");
      return false;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      toast.error("End date must be after the start date.");
      return false;
    }

    // --------------------------------------------------------
    // Flash Sale
    // --------------------------------------------------------
    if (form.type === "flash_sale") {
      const discount = Number(form.discountValue);

      if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
        toast.error("Flash sale discount must be between 1% and 100%.");
        return false;
      }
    }

    // --------------------------------------------------------
    // Quantity Discount
    // --------------------------------------------------------
    if (form.type === "quantity_discount") {
      if (form.tiers.length === 0) {
        toast.error("Add at least one quantity discount tier.");
        return false;
      }

      const quantities = [];

      for (let index = 0; index < form.tiers.length; index++) {
        const tier = form.tiers[index];

        const quantity = Number(tier.quantity);
        const discount = Number(tier.discount);

        if (!Number.isInteger(quantity) || quantity < 1) {
          toast.error(
            `Tier ${index + 1}: quantity must be a positive whole number.`,
          );
          return false;
        }

        if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
          toast.error(
            `Tier ${index + 1}: discount must be between 1% and 100%.`,
          );
          return false;
        }

        quantities.push(quantity);
      }

      if (new Set(quantities).size !== quantities.length) {
        toast.error(
          "Quantity discount tiers cannot have duplicate quantities.",
        );
        return false;
      }
    }

    // --------------------------------------------------------
    // Bundle
    // --------------------------------------------------------
    if (form.type === "bundle") {
      const bundlePrice = Number(form.bundlePrice);

      if (!Number.isFinite(bundlePrice) || bundlePrice <= 0) {
        toast.error("Please enter a valid bundle price.");
        return false;
      }

      if (form.products.length < 2) {
        toast.error("A bundle must contain at least two products.");
        return false;
      }

      const normalTotal = form.products.reduce((total, productId) => {
        const product = products.find(
          (item) => String(item.id) === String(productId),
        );

        const price = Number(product?.discountPrice ?? product?.price ?? 0);

        return total + price;
      }, 0);

      if (normalTotal > 0 && bundlePrice >= normalTotal) {
        toast.error(
          "Bundle price must be lower than the normal combined product price.",
        );
        return false;
      }
    }

    return true;
  };

  // ==========================================================
  // Submit
  // ==========================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // ------------------------------------------------------
      // Get current deal so createdAt is preserved.
      // ------------------------------------------------------
      const existingDeal = await getDealById(id);

      // ------------------------------------------------------
      // Base deal object
      // ------------------------------------------------------
      const dealData = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        products: form.products.map(String),
        priority: Number(form.priority),
        startDate: toISOStringOrNull(form.startDate),
        endDate: toISOStringOrNull(form.endDate),
        isActive: Boolean(form.isActive),
        createdAt: existingDeal.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ------------------------------------------------------
      // Flash Sale
      // ------------------------------------------------------
      if (form.type === "flash_sale") {
        dealData.discountValue = Number(form.discountValue);
      }

      // ------------------------------------------------------
      // BOGO
      // ------------------------------------------------------
      if (form.type === "bogo") {
        dealData.discountValue = 0;
      }

      // ------------------------------------------------------
      // Quantity Discount
      // ------------------------------------------------------
      if (form.type === "quantity_discount") {
        dealData.tiers = [...form.tiers]
          .map((tier) => ({
            quantity: Number(tier.quantity),
            discount: Number(tier.discount),
          }))
          .sort((a, b) => a.quantity - b.quantity);
      }

      // ------------------------------------------------------
      // Bundle
      // ------------------------------------------------------
      if (form.type === "bundle") {
        dealData.bundlePrice = Number(form.bundlePrice);
      }

      // ------------------------------------------------------
      // Remove fields that belong to
      // another deal type.
      // ------------------------------------------------------
      if (form.type !== "flash_sale") {
        delete dealData.discountValue;
      }

      if (form.type !== "quantity_discount") {
        delete dealData.tiers;
      }

      if (form.type !== "bundle") {
        delete dealData.bundlePrice;
      }

      // ------------------------------------------------------
      // Update deal
      // ------------------------------------------------------
      await updateDeal(id, dealData);

      toast.success("Deal updated successfully.");

      navigate("/deals");
    } catch (error) {
      console.error("Failed to update deal:", error);

      toast.error(error?.response?.data?.message || "Failed to update deal.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // Selected products
  // ==========================================================
  const selectedProducts = products.filter((product) =>
    form.products.some((id) => String(id) === String(product.id)),
  );

  // ==========================================================
  // Loading
  // ==========================================================
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading deal...</p>
      </div>
    );
  }

  // ==========================================================
  // Render
  // ==========================================================
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Button
          type="button"
          variant="ghost"
          className="-ml-3 mb-2"
          onClick={() => navigate("/deals")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Deals
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Edit Deal</h1>

        <p className="mt-1 text-muted-foreground">
          Update the configuration of this promotional deal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ====================================================
            BASIC INFORMATION
        ===================================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title *</Label>

              <Input
                id="title"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="Weekend Flash Sale"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                placeholder="Describe the deal..."
                rows={4}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Type */}
              <div className="space-y-2">
                <Label>Deal Type *</Label>

                <Select
                  value={form.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="flash_sale">Flash Sale</SelectItem>

                    <SelectItem value="bogo">Buy 1 Get 1 Free</SelectItem>

                    <SelectItem value="quantity_discount">
                      Quantity Discount
                    </SelectItem>

                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>

                <Input
                  id="priority"
                  type="number"
                  min="1"
                  step="1"
                  value={form.priority}
                  onChange={(event) =>
                    handleChange("priority", event.target.value)
                  }
                />

                <p className="text-xs text-muted-foreground">
                  Lower numbers have higher priority.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ====================================================
            PRODUCTS
        ===================================================== */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Products</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select the products that participate in this deal.
                </p>
              </div>

              <div className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                {form.products.length} selected
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loadingProducts ? (
              <div className="flex min-h-32 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Loading products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No products available.
                </p>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((product) => {
                    const selected = form.products.some(
                      (id) => String(id) === String(product.id),
                    );

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="size-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="size-14 rounded-lg bg-muted" />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {product.title}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              ₹
                              {Number(
                                product.discountPrice ?? product.price ?? 0,
                              ).toLocaleString("en-IN")}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Stock: {product.stock}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 text-xs font-medium">
                          {selected ? "✓ Selected" : "Click to select"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, products.length)}{" "}
                      of {products.length} products
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => page - 1)}
                      >
                        Previous
                      </Button>

                      <span className="min-w-24 text-center text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((page) => page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="mt-5 rounded-xl bg-muted/50 p-4">
                <p className="text-sm font-medium">Selected Products</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedProducts.map((product) => (
                    <span
                      key={product.id}
                      className="rounded-full bg-background px-3 py-1 text-xs"
                    >
                      {product.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====================================================
            DEAL CONFIGURATION
        ===================================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Configuration</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Flash Sale */}
            {form.type === "flash_sale" && (
              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Percentage *</Label>

                <div className="flex items-center gap-2">
                  <Input
                    id="discountValue"
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    value={form.discountValue}
                    onChange={(event) =>
                      handleChange("discountValue", event.target.value)
                    }
                    placeholder="30"
                  />

                  <span className="font-medium">%</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Example: 30 means 30% off.
                </p>
              </div>
            )}

            {/* BOGO */}
            {form.type === "bogo" && (
              <div className="rounded-xl border bg-muted/30 p-5">
                <h3 className="font-semibold">Buy 1 Get 1 Free</h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  The current customer-side calculation service determines the
                  free quantity automatically from the cart quantity.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Quantity 1</p>
                    <p className="mt-1 font-semibold">Pay 1</p>
                  </div>

                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Quantity 2</p>
                    <p className="mt-1 font-semibold">Pay 1</p>
                  </div>

                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Quantity 3</p>
                    <p className="mt-1 font-semibold">Pay 2</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Discount */}
            {form.type === "quantity_discount" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Discount Tiers</h3>

                    <p className="text-sm text-muted-foreground">
                      Configure quantity thresholds and discounts.
                    </p>
                  </div>

                  <Button type="button" variant="outline" onClick={addTier}>
                    <Plus className="mr-2 size-4" />
                    Add Tier
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.tiers.map((tier, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    >
                      <div className="space-y-2">
                        <Label>Minimum Quantity</Label>

                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={tier.quantity}
                          onChange={(event) =>
                            updateTier(index, "quantity", event.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Discount %</Label>

                        <Input
                          type="number"
                          min="1"
                          max="100"
                          step="0.01"
                          value={tier.discount}
                          onChange={(event) =>
                            updateTier(index, "discount", event.target.value)
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTier(index)}
                        disabled={form.tiers.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bundle */}
            {form.type === "bundle" && (
              <div className="space-y-2">
                <Label htmlFor="bundlePrice">Bundle Price *</Label>

                <Input
                  id="bundlePrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.bundlePrice}
                  onChange={(event) =>
                    handleChange("bundlePrice", event.target.value)
                  }
                  placeholder="2499"
                />

                <p className="text-xs text-muted-foreground">
                  The bundle price must be lower than the combined price of the
                  selected products.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====================================================
            SCHEDULE
        ===================================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>

                <Input
                  id="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(event) =>
                    handleChange("startDate", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>

                <Input
                  id="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(event) =>
                    handleChange("endDate", event.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ====================================================
            STATUS
        ===================================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">Active Deal</p>

                <p className="text-sm text-muted-foreground">
                  Enable or disable this deal.
                </p>
              </div>

              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ====================================================
            ACTIONS
        ===================================================== */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/deals")}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditDeals;
