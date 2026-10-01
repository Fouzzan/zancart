import { AlertTriangle, Boxes, PackageX, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import { getProducts } from "@/features/products/productService";

const ITEMS_PER_PAGE = 10;
const LOW_STOCK_LIMIT = 5;

function Inventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
        setError("Unable to load inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.title?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm);

      const stock = Number(product.stock) || 0;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > LOW_STOCK_LIMIT) ||
        (stockFilter === "low-stock" &&
          stock > 0 &&
          stock <= LOW_STOCK_LIMIT) ||
        (stockFilter === "out-of-stock" && stock === 0);

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, stockFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStockStatus = (stock) => {
    const quantity = Number(stock) || 0;

    if (quantity === 0) {
      return {
        label: "Out of Stock",
        className: "text-destructive",
      };
    }

    if (quantity <= LOW_STOCK_LIMIT) {
      return {
        label: "Low Stock",
        className: "text-amber-600",
      };
    }

    return {
      label: "In Stock",
      className: "text-green-600",
    };
  };

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stock) > 0 && Number(product.stock) <= LOW_STOCK_LIMIT,
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) === 0,
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Monitor and manage product stock.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>

        <p className="text-muted-foreground">
          Monitor and manage your ZanCart product stock.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Boxes className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <PackageX className="size-5 text-destructive" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold">{outOfStockCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Stock Overview</CardTitle>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
            </div>

            <div className="w-full sm:w-48">
              <Label className="sr-only">Stock status</Label>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Stock status" />
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
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Product
                      </th>

                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Category
                      </th>

                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Brand
                      </th>

                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Stock
                      </th>

                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedProducts.map((product) => {
                      const stock = Number(product.stock) || 0;
                      const status = getStockStatus(stock);

                      return (
                        <tr
                          key={product.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                    —
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-56 truncate font-medium">
                                  {product.title}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  ID: {product.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {product.category}
                          </td>

                          <td className="px-4 py-4 text-sm">{product.brand}</td>

                          <td className="px-4 py-4">
                            <span
                              className={
                                stock <= LOW_STOCK_LIMIT
                                  ? "font-semibold text-destructive"
                                  : "font-medium"
                              }
                            >
                              {stock}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`text-sm font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/products/${product.id}/edit`)
                                }
                              >
                                Edit Stock
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  {filteredProducts.length === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                  -{" "}
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

                  <span className="text-sm text-muted-foreground">
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
    </div>
  );
}

export default Inventory;
