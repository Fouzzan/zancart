import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // -----------------------------------------
  // Fetch categories + products
  // -----------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/products`),
      ]);

      if (!categoriesResponse.ok) {
        throw new Error("Failed to fetch categories");
      }

      if (!productsResponse.ok) {
        throw new Error("Failed to fetch products");
      }

      const [categoriesData, productsData] = await Promise.all([
        categoriesResponse.json(),
        productsResponse.json(),
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error(error);
      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -----------------------------------------
  // Get number of products using a category
  // -----------------------------------------
  const getProductCount = (categoryName) => {
    return products.filter((product) => product.category === categoryName)
      .length;
  };

  // -----------------------------------------
  // Add / Edit category
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase() &&
        category.id !== editingId,
    );

    if (duplicate) {
      setError("This category already exists.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // -----------------------------------------
      // EDIT CATEGORY
      // -----------------------------------------
      if (editingId) {
        const oldCategory = categories.find(
          (category) => category.id === editingId,
        );

        if (!oldCategory) {
          throw new Error("Category not found");
        }

        const oldName = oldCategory.name;

        // Update category itself
        const response = await fetch(`${API_URL}/categories/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update category");
        }

        // -----------------------------------------
        // Update products using old category name
        // -----------------------------------------
        const productsUsingCategory = products.filter(
          (product) => product.category === oldName,
        );

        await Promise.all(
          productsUsingCategory.map((product) =>
            fetch(`${API_URL}/products/${product.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                category: name,
              }),
            }),
          ),
        );
      }

      // -----------------------------------------
      // ADD CATEGORY
      // -----------------------------------------
      else {
        const response = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create category");
        }
      }

      setCategoryName("");
      setEditingId(null);

      await fetchData();
    } catch (error) {
      console.error(error);

      setError(
        editingId ? "Unable to update category." : "Unable to create category.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Edit
  // -----------------------------------------
  const handleEdit = (category) => {
    setEditingId(category.id);
    setCategoryName(category.name);
    setError("");
  };

  // -----------------------------------------
  // Delete
  // -----------------------------------------
  const handleDelete = async (category) => {
    const productCount = getProductCount(category.name);

    // Prevent deletion if products are using category
    if (productCount > 0) {
      setCategoryToDelete(null);

      setError(
        `Cannot delete "${category.name}" because ${productCount} product${
          productCount === 1 ? "" : "s"
        } ${productCount === 1 ? "is" : "are"} using this category.`,
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setCategoryToDelete(null);

      await fetchData();
    } catch (error) {
      console.error(error);
      setError("Unable to delete category.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Cancel edit
  // -----------------------------------------
  const handleCancelEdit = () => {
    setEditingId(null);
    setCategoryName("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>

        <p className="text-muted-foreground">
          Manage the product categories in your ZanCart store.
        </p>
      </div>

      {/* Add / Edit Form */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit Category" : "Add Category"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            disabled={loading}
          />

          <Button type="submit" disabled={loading}>
            {editingId ? (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Update
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </>
            )}
          </Button>

          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </form>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">All Categories</h2>
        </div>

        {loading && categories.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">#</TableHead>

                  <TableHead>Category</TableHead>

                  <TableHead>Products</TableHead>

                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map((category, index) => {
                  const productCount = getProductCount(category.name);

                  const hasProducts = productCount > 0;

                  return (
                    <TableRow key={category.id}>
                      {/* Number */}
                      <TableCell className="text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* Category */}
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>

                      {/* Products */}
                      <TableCell>
                        <span
                          className={
                            hasProducts
                              ? "text-sm font-medium"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {productCount}{" "}
                          {productCount === 1 ? "product" : "products"}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            disabled={loading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setCategoryToDelete(category)}
                            disabled={loading || hasProducts}
                            title={
                              hasProducts
                                ? `Cannot delete: ${productCount} ${
                                    productCount === 1
                                      ? "product uses"
                                      : "products use"
                                  } this category.`
                                : "Delete category"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {categoryToDelete?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (categoryToDelete) {
                  handleDelete(categoryToDelete);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Categories;
