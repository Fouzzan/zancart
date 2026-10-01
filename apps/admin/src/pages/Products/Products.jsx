import { AlertTriangle, Package, PackageX, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  setError,
  setLoading,
  setProducts,
} from "@/features/products/productSlice";

import { deleteProduct, getProducts } from "@/features/products/productService";

const ITEMS_PER_PAGE = 10;
const LOW_STOCK_LIMIT = 5;

function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector((state) => state.products);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /*
   * Fetch products
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const data = await getProducts();

        dispatch(setProducts(data));
      } catch (error) {
        console.error("Failed to fetch products:", error);

        dispatch(setError("Unable to load products."));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchProducts();
  }, [dispatch]);

  /*
   * Unique categories
   */
  const categories = useMemo(() => {
    return [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ].sort();
  }, [products]);

  /*
   * Unique brands
   */
  const brands = useMemo(() => {
    return [
      ...new Set(products.map((product) => product.brand).filter(Boolean)),
    ].sort();
  }, [products]);

  /*
   * Inventory statistics
   */
  const inventoryStats = useMemo(() => {
    const total = products.length;

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock) || 0;

      return stock > 0 && stock <= LOW_STOCK_LIMIT;
    }).length;

    const outOfStock = products.filter((product) => {
      const stock = Number(product.stock) || 0;

      return stock === 0;
    }).length;

    return {
      total,
      lowStock,
      outOfStock,
    };
  }, [products]);

  /*
   * Filtering
   */
  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const stock = Number(product.stock) || 0;

      const matchesSearch =
        !searchTerm ||
        product.title?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm);

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesBrand =
        brandFilter === "all" || product.brand === brandFilter;

      let matchesStock = true;

      if (stockFilter === "in-stock") {
        matchesStock = stock > LOW_STOCK_LIMIT;
      }

      if (stockFilter === "low-stock") {
        matchesStock = stock > 0 && stock <= LOW_STOCK_LIMIT;
      }

      if (stockFilter === "out-of-stock") {
        matchesStock = stock === 0;
      }

      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });
  }, [products, search, categoryFilter, brandFilter, stockFilter]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  /*
   * Reset pagination when filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, brandFilter, stockFilter]);

  /*
   * Keep page valid
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
   * Stock status
   */
  const getStockStatus = (stock) => {
    const quantity = Number(stock) || 0;

    if (quantity === 0) {
      return {
        label: "Out of Stock",
        variant: "destructive",
      };
    }

    if (quantity <= LOW_STOCK_LIMIT) {
      return {
        label: "Low Stock",
        variant: "warning",
      };
    }

    return {
      label: "In Stock",
      variant: "success",
    };
  };

  /*
   * Delete product
   */
  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      setDeleteLoading(true);

      await deleteProduct(deleteProductId);

      const updatedProducts = products.filter(
        (product) => product.id !== deleteProductId,
      );

      dispatch(setProducts(updatedProducts));

      setDeleteProductId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);

      dispatch(setError("Unable to delete product. Please try again."));
    } finally {
      setDeleteLoading(false);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>

          <p className="text-muted-foreground">
            Manage your ZanCart products and inventory.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-4">
            <p className="text-destructive">{error}</p>

            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>

          <p className="text-muted-foreground">
            Manage your products and inventory.
          </p>
        </div>

        <Button onClick={() => navigate("/products/add")}>Add Product</Button>
      </div>

      {/* Inventory Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>

              <p className="text-2xl font-bold">{inventoryStats.total}</p>
            </div>
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>

              <p className="text-2xl font-bold">{inventoryStats.lowStock}</p>
            </div>
          </CardContent>
        </Card>

        {/* Out of stock */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <PackageX className="size-5 text-destructive" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>

              <p className="text-2xl font-bold">{inventoryStats.outOfStock}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Products ({filteredProducts.length})</CardTitle>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-10 pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Category */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 w-[160px]">
                  <SelectValue>
                    {categoryFilter === "all"
                      ? "All Categories"
                      : categoryFilter}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>

                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Brand */}
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="h-10 w-[140px]">
                  <SelectValue>
                    {brandFilter === "all" ? "All Brands" : brandFilter}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>

                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stock */}
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="h-10 w-[140px]">
                  <SelectValue>
                    {stockFilter === "all"
                      ? "All Stock"
                      : stockFilter === "in-stock"
                        ? "In Stock"
                        : stockFilter === "low-stock"
                          ? "Low Stock"
                          : "Out of Stock"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>

                  <SelectItem value="in-stock">In Stock</SelectItem>

                  <SelectItem value="low-stock">Low Stock</SelectItem>

                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {paginatedProducts.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No products found.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedProducts.map((product) => {
                      const stock = Number(product.stock) || 0;

                      const status = getStockStatus(stock);

                      return (
                        <TableRow key={product.id}>
                          {/* Product */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    loading="lazy"
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                    No image
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-52 truncate font-medium">
                                  {product.title}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  ID: {product.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Category */}
                          <TableCell>{product.category || "—"}</TableCell>

                          {/* Brand */}
                          <TableCell>{product.brand || "—"}</TableCell>

                          {/* Price */}
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                ₹{product.discountPrice}
                              </p>

                              {product.price &&
                                product.price !== product.discountPrice && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    ₹{product.price}
                                  </p>
                                )}
                            </div>
                          </TableCell>

                          {/* Stock */}
                          <TableCell>
                            <span
                              className={
                                stock <= LOW_STOCK_LIMIT
                                  ? "font-semibold text-destructive"
                                  : "font-medium"
                              }
                            >
                              {stock}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                status.label === "In Stock"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : status.label === "Low Stock"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                              }
                            >
                              <span
                                className={
                                  status.label === "In Stock"
                                    ? "size-1.5 rounded-full bg-green-600"
                                    : status.label === "Low Stock"
                                      ? "size-1.5 rounded-full bg-amber-600"
                                      : "size-1.5 rounded-full bg-red-600"
                                }
                              />

                              {status.label}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/products/${product.id}/edit`)
                                }
                              >
                                Edit
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteProductId(product.id)}
                              >
                                <Trash2 className="mr-1 size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredProducts.length,
                  )}{" "}
                  of {filteredProducts.length}
                </p>

                <div className="flex items-center gap-2">
                  <Button
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
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(deleteProductId)}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            setDeleteProductId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed from your product database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Products;
