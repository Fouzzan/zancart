import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  addBrand,
  removeBrand,
  setBrands,
  setError,
  setLoading,
  updateBrand,
} from "@/features/brands/brandSlice";

import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand as updateBrandApi,
} from "@/features/brands/brandService";

function Brands() {
  const dispatch = useDispatch();

  const { brands, loading, error } = useSelector((state) => state.brands);

  const [products, setProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState("");

  const [formError, setFormError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // -----------------------------------------
  // Fetch brands + products
  // -----------------------------------------
  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const [brandsResponse, productsResponse] = await Promise.all([
        getBrands(),
        fetch(`${API_URL}/products`),
      ]);

      if (!productsResponse.ok) {
        throw new Error("Failed to fetch products");
      }

      const productsData = await productsResponse.json();

      dispatch(setBrands(brandsResponse));
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch brands:", error);

      dispatch(setError("Unable to load brands."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // -----------------------------------------
  // Get product count for a brand
  // -----------------------------------------
  const getProductCount = (brandName) => {
    return products.filter((product) => product.brand === brandName).length;
  };

  // -----------------------------------------
  // Filter brands
  // -----------------------------------------
  const filteredBrands = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter((brand) => brand.name.toLowerCase().includes(query));
  }, [brands, searchQuery]);

  // -----------------------------------------
  // Open add dialog
  // -----------------------------------------
  const openAddDialog = () => {
    setEditingBrand(null);
    setBrandName("");
    setFormError("");
    setDialogOpen(true);
  };

  // -----------------------------------------
  // Open edit dialog
  // -----------------------------------------
  const openEditDialog = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setFormError("");
    setDialogOpen(true);
  };

  // -----------------------------------------
  // Add / Edit brand
  // -----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = brandName.trim();

    if (!trimmedName) {
      setFormError("Brand name is required.");
      return;
    }

    const duplicateBrand = brands.some(
      (brand) =>
        brand.name.toLowerCase() === trimmedName.toLowerCase() &&
        brand.id !== editingBrand?.id,
    );

    if (duplicateBrand) {
      setFormError("A brand with this name already exists.");
      return;
    }

    try {
      setFormError("");

      // -----------------------------------------
      // EDIT BRAND
      // -----------------------------------------
      if (editingBrand) {
        const oldName = editingBrand.name;

        const updatedBrand = await updateBrandApi(editingBrand.id, {
          name: trimmedName,
        });

        // Update products using old brand name
        const productsUsingBrand = products.filter(
          (product) => product.brand === oldName,
        );

        await Promise.all(
          productsUsingBrand.map((product) =>
            fetch(`${API_URL}/products/${product.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                brand: trimmedName,
              }),
            }),
          ),
        );

        dispatch(updateBrand(updatedBrand));

        // Refresh products so counts stay accurate
        const productsResponse = await fetch(`${API_URL}/products`);

        if (!productsResponse.ok) {
          throw new Error("Failed to refresh products");
        }

        const productsData = await productsResponse.json();

        setProducts(productsData);
      }

      // -----------------------------------------
      // ADD BRAND
      // -----------------------------------------
      else {
        const createdBrand = await createBrand({
          name: trimmedName,
        });

        dispatch(addBrand(createdBrand));
      }

      setDialogOpen(false);
      setBrandName("");
      setEditingBrand(null);
    } catch (error) {
      console.error("Failed to save brand:", error);

      setFormError("Unable to save brand. Please try again.");
    }
  };

  // -----------------------------------------
  // Delete brand
  // -----------------------------------------
  const handleDelete = async () => {
    if (!brandToDelete) {
      return;
    }

    const productCount = getProductCount(brandToDelete.name);

    // Safety validation
    // Prevent deletion even if the UI
    // somehow allows the action.
    if (productCount > 0) {
      setDeleteDialogOpen(false);

      setFormError(
        `Cannot delete "${brandToDelete.name}" because ${productCount} product${
          productCount === 1 ? "" : "s"
        } ${productCount === 1 ? "is" : "are"} using this brand.`,
      );

      setBrandToDelete(null);

      return;
    }

    try {
      await deleteBrand(brandToDelete.id);

      dispatch(removeBrand(brandToDelete.id));

      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    } catch (error) {
      console.error("Failed to delete brand:", error);

      setFormError("Unable to delete brand. Please try again.");
    }
  };

  // -----------------------------------------
  // Loading state
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading brands...</p>
      </div>
    );
  }

  // -----------------------------------------
  // Error state
  // -----------------------------------------
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>

          <p className="text-muted-foreground">Manage your ZanCart brands.</p>
        </div>

        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-4">
            <p className="text-sm text-destructive">{error}</p>

            <Button onClick={fetchData}>Try Again</Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>

          <p className="text-muted-foreground">
            Manage the brands available in your ZanCart store.
          </p>
        </div>

        <Button onClick={openAddDialog}>
          <Plus className="mr-2 size-4" />
          Add Brand
        </Button>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Edit Brand" : "Add Brand"}
            </DialogTitle>

            <DialogDescription>
              {editingBrand
                ? "Update the brand name below."
                : "Add a new brand to your ZanCart store."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="brand-name" className="text-sm font-medium">
                Brand Name
              </label>

              <Input
                id="brand-name"
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                placeholder="e.g. Nike"
                autoFocus
              />

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit">
                {editingBrand ? "Save Changes" : "Add Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Brands */}
      <Card>
        <CardHeader>
          <CardTitle>Brands ({brands.length})</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search brands..."
              className="pl-9"
            />
          </div>

          {filteredBrands.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No brands match your search."
                  : "No brands found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Brand</TableHead>

                    <TableHead>Products</TableHead>

                    <TableHead>ID</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBrands.map((brand) => {
                    const productCount = getProductCount(brand.name);

                    const hasProducts = productCount > 0;

                    return (
                      <TableRow key={brand.id}>
                        {/* Brand */}
                        <TableCell>
                          <p className="font-medium">{brand.name}</p>
                        </TableCell>

                        {/* Product Count */}
                        <TableCell>
                          <span
                            className={
                              hasProducts
                                ? "text-sm font-medium text-foreground"
                                : "text-sm text-muted-foreground"
                            }
                          >
                            {productCount}{" "}
                            {productCount === 1 ? "product" : "products"}
                          </span>
                        </TableCell>

                        {/* ID */}
                        <TableCell className="text-sm text-muted-foreground">
                          {brand.id}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(brand)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={hasProducts}
                              title={
                                hasProducts
                                  ? `Cannot delete: ${productCount} product${
                                      productCount === 1 ? "" : "s"
                                    } use this brand.`
                                  : "Delete brand"
                              }
                              onClick={() => {
                                setBrandToDelete(brand);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
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
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete brand?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {brandToDelete?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Brands;
