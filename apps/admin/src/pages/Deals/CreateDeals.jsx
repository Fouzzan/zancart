import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

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

import { createDeal } from "../../features/deals/dealServices";
import api from "../../services/api";

const INITIAL_FORM = {
  title: "",
  description: "",
  type: "flash_sale",
  products: [],
  discountValue: "",
  tiers: [
    {
      quantity: 2,
      discount: 10,
    },
  ],
  bundlePrice: "",
  priority: 1,
  startDate: "",
  endDate: "",
  isActive: true,
};

const PRODUCTS_PER_PAGE = 12;

function CreateDeals() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [products, setProducts] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Product search + pagination
  const [productSearch, setProductSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // Fetch products
  // ============================================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        const response = await api.get("/products");

        const data = Array.isArray(response.data) ? response.data : [];

        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);

        toast.error("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // ============================================================
  // Generic field change
  // ============================================================
  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================================================
  // Product search
  // ============================================================
  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      const title = String(product.title ?? "").toLowerCase();
      const brand = String(product.brand ?? "").toLowerCase();
      const category = String(product.category ?? "").toLowerCase();

      return (
        title.includes(search) ||
        brand.includes(search) ||
        category.includes(search)
      );
    });
  }, [products, productSearch]);

  // ============================================================
  // Pagination
  // ============================================================
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [productSearch]);

  // Keep the current page valid if products/filter results change
  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  const goToPreviousPage = () => {
    setCurrentPage((previous) => Math.max(previous - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((previous) => Math.min(previous + 1, totalPages));
  };

  // ============================================================
  // Selected product IDs
  // ============================================================
  const selectedProductSet = useMemo(() => {
    return new Set(form.products.map((id) => String(id)));
  }, [form.products]);

  // ============================================================
  // Product selection
  // ============================================================
  const toggleProduct = (productId) => {
    const normalizedId = String(productId);

    setForm((previous) => {
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

  // ============================================================
  // Quantity discount tiers
  // ============================================================
  const addTier = () => {
    setForm((previous) => ({
      ...previous,
      tiers: [
        ...previous.tiers,
        {
          quantity: previous.tiers.length + 2,
          discount: 10,
        },
      ],
    }));
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

  // ============================================================
  // Validation
  // ============================================================
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

    // ----------------------------------------------------------
    // Flash Sale
    // ----------------------------------------------------------
    if (form.type === "flash_sale") {
      const discount = Number(form.discountValue);

      if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
        toast.error("Flash sale discount must be between 1% and 100%.");
        return false;
      }
    }

    // ----------------------------------------------------------
    // Quantity Discount
    // ----------------------------------------------------------
    if (form.type === "quantity_discount") {
      if (form.tiers.length === 0) {
        toast.error("Add at least one quantity discount tier.");
        return false;
      }

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
      }

      // Make sure tiers don't contain
      // duplicate quantities.
      const quantities = form.tiers.map((tier) => Number(tier.quantity));

      if (new Set(quantities).size !== quantities.length) {
        toast.error(
          "Quantity discount tiers cannot have duplicate quantities.",
        );
        return false;
      }
    }

    // ----------------------------------------------------------
    // Bundle
    // ----------------------------------------------------------
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

      // Calculate the normal total using
      // the product's current selling price.
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

  // ============================================================
  // Submit
  // ============================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // --------------------------------------------------------
      // Base deal object
      // --------------------------------------------------------
      const dealData = {
        title: form.title.trim(),

        description: form.description.trim(),

        type: form.type,

        products: form.products.map(String),

        priority: Number(form.priority),

        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : null,

        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,

        isActive: Boolean(form.isActive),

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString(),
      };

      // --------------------------------------------------------
      // Flash Sale
      // --------------------------------------------------------
      if (form.type === "flash_sale") {
        dealData.discountValue = Number(form.discountValue);
      }

      // --------------------------------------------------------
      // BOGO
      // --------------------------------------------------------
      // Your current deal calculation logic
      // implements BOGO as:
      //
      // quantity 2 → pay for 1
      // quantity 3 → pay for 2
      // quantity 4 → pay for 2
      //
      // Therefore no additional
      // freeQuantity field is required
      // for the current calculation service.
      // --------------------------------------------------------
      if (form.type === "bogo") {
        dealData.discountValue = 0;
      }

      // --------------------------------------------------------
      // Quantity Discount
      // --------------------------------------------------------
      if (form.type === "quantity_discount") {
        dealData.tiers = [...form.tiers]
          .map((tier) => ({
            quantity: Number(tier.quantity),
            discount: Number(tier.discount),
          }))
          .sort((a, b) => a.quantity - b.quantity);
      }

      // --------------------------------------------------------
      // Bundle
      // --------------------------------------------------------
      if (form.type === "bundle") {
        dealData.bundlePrice = Number(form.bundlePrice);
      }

      // --------------------------------------------------------
      // Create
      // --------------------------------------------------------
      await createDeal(dealData);

      toast.success("Deal created successfully.");

      navigate("/deals");
    } catch (error) {
      console.error("Failed to create deal:", error);

      toast.error(error?.response?.data?.message || "Failed to create deal.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Reset
  // ============================================================
  const handleReset = () => {
    setForm(INITIAL_FORM);
    setProductSearch("");
    setCurrentPage(1);
  };

  // ============================================================
  // Selected product details
  // ============================================================
  const selectedProducts = useMemo(() => {
    return products.filter((product) =>
      selectedProductSet.has(String(product.id)),
    );
  }, [products, selectedProductSet]);

  // ============================================================
  // Pagination display
  // ============================================================
  const showingFrom =
    filteredProducts.length === 0
      ? 0
      : (safeCurrentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const showingTo = Math.min(
    safeCurrentPage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            type="button"
            variant="ghost"
            className="mb-2 -ml-3"
            onClick={() => navigate("/deals")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Deals
          </Button>

          <h1 className="text-3xl font-bold tracking-tight">Create Deal</h1>

          <p className="mt-1 text-muted-foreground">
            Create a new promotional deal for your products.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =====================================================
            BASIC INFORMATION
        ====================================================== */}
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

            {/* Type + Priority */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Deal Type *</Label>

                <Select
                  value={form.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal type" />
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

        {/* =====================================================
            PRODUCTS
        ====================================================== */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Products</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select the products that participate in this deal.
                </p>
              </div>

              <div className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-medium">
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
              <div className="space-y-5">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search products by name, brand or category..."
                    className="pl-9"
                  />
                </div>

                {/* Search result information */}
                <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    {filteredProducts.length === 0
                      ? "No products found."
                      : `Showing ${showingFrom}-${showingTo} of ${filteredProducts.length} products`}
                  </p>

                  {productSearch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProductSearch("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>

                {/* Product cards */}
                {filteredProducts.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No products match your search.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedProducts.map((product) => {
                      const selected = selectedProductSet.has(
                        String(product.id),
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
                                loading="lazy"
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
                )}

                {/* Pagination */}
                {filteredProducts.length > PRODUCTS_PER_PAGE && (
                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {safeCurrentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={safeCurrentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="rounded-md border px-3 py-1.5 text-sm font-medium">
                        {safeCurrentPage}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={safeCurrentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selected products summary */}
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

        {/* =====================================================
            DEAL CONFIGURATION
        ====================================================== */}
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
                  Example: 30 means the product receives a 30% discount.
                </p>
              </div>
            )}

            {/* BOGO */}
            {form.type === "bogo" && (
              <div className="rounded-xl border bg-muted/30 p-5">
                <h3 className="font-semibold">Buy 1 Get 1 Free</h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  The current deal calculation automatically calculates the free
                  quantity from the cart quantity.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Quantity</p>

                    <p className="mt-1 font-semibold">1</p>

                    <p className="text-xs">Pay for 1</p>
                  </div>

                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Quantity</p>

                    <p className="mt-1 font-semibold">2</p>

                    <p className="text-xs">Pay for 1</p>
                  </div>

                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Quantity</p>

                    <p className="mt-1 font-semibold">3</p>

                    <p className="text-xs">Pay for 2</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Discount */}
            {form.type === "quantity_discount" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Discount Tiers</h3>

                    <p className="text-sm text-muted-foreground">
                      Add the quantity thresholds and their discounts.
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
                  The bundle price must be lower than the combined normal price
                  of the selected products.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* =====================================================
            SCHEDULE
        ====================================================== */}
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

        {/* =====================================================
            STATUS
        ====================================================== */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">Active Deal</p>

                <p className="text-sm text-muted-foreground">
                  Enable this deal immediately after creation.
                </p>
              </div>

              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            ACTIONS
        ====================================================== */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={submitting}
          >
            Reset
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/deals")}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Deal"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateDeals;
