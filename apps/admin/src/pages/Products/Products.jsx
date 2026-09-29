import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  setError,
  setLoading,
  setProducts,
} from "@/features/products/productSlice";

import { getProducts } from "@/features/products/productService";

function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector((state) => state.products);

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

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your ZanCart products.</p>
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>

          <p className="text-muted-foreground">Manage your ZanCart products.</p>
        </div>

        <Button onClick={() => navigate("/products/add")}>Add Product</Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {products.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No products found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
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
                      Price
                    </th>

                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                      Stock
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      {/* Product */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {product.title}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 text-sm">{product.category}</td>

                      {/* Brand */}
                      <td className="px-4 py-4 text-sm">{product.brand}</td>

                      {/* Price */}
                      <td className="px-4 py-4">
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
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4">
                        <span
                          className={
                            product.stock <= 5
                              ? "font-medium text-destructive"
                              : "text-sm"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
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

                          <Button variant="destructive" size="sm">
                            Delete
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

export default Products;
