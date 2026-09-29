import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const emptyProduct = {
  title: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  subcategory: "",
  brand: "",
  stock: "",
  images: [""],
  featured: false,
  trending: false,
};

function ProductForm({
  initialData = emptyProduct,
  onSubmit,
  loading = false,
  error = "",
  submitLabel = "Save Product",
}) {
  const [formData, setFormData] = useState({
    ...emptyProduct,
    ...initialData,
    images: initialData?.images?.length > 0 ? initialData.images : [""],
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (index, value) => {
    setFormData((previous) => {
      const updatedImages = [...previous.images];

      updatedImages[index] = value;

      return {
        ...previous,
        images: updatedImages,
      };
    });
  };

  const addImageField = () => {
    setFormData((previous) => ({
      ...previous,
      images: [...previous.images, ""],
    }));
  };

  const removeImageField = (index) => {
    setFormData((previous) => ({
      ...previous,
      images: previous.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleToggle = (name) => {
    setFormData((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedImages = formData.images
      .map((image) => image.trim())
      .filter(Boolean);

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.discountPrice ||
      !formData.category.trim() ||
      !formData.subcategory.trim() ||
      !formData.brand.trim() ||
      !formData.stock ||
      cleanedImages.length === 0
    ) {
      onSubmit(null, "Please fill in all required fields.");
      return;
    }

    if (Number(formData.price) <= 0) {
      onSubmit(null, "Price must be greater than 0.");
      return;
    }

    if (Number(formData.discountPrice) <= 0) {
      onSubmit(null, "Discount price must be greater than 0.");
      return;
    }

    if (Number(formData.discountPrice) > Number(formData.price)) {
      onSubmit(
        null,
        "Discount price cannot be greater than the original price.",
      );
      return;
    }

    if (Number(formData.stock) < 0) {
      onSubmit(null, "Stock cannot be negative.");
      return;
    }

    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      discountPrice: Number(formData.discountPrice),
      category: formData.category.trim(),
      subcategory: formData.subcategory.trim(),
      brand: formData.brand.trim(),
      stock: Number(formData.stock),
      images: cleanedImages,
      featured: formData.featured,
      trending: formData.trending,

      // Initial review data
      rating: 0,
      reviewCount: 0,
    };

    onSubmit(productData, "");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Product Name
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>

              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Fashion"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subcategory" className="text-sm font-medium">
                Subcategory
              </label>

              <input
                id="subcategory"
                name="subcategory"
                type="text"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="e.g. T-Shirts"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="brand" className="text-sm font-medium">
              Brand
            </label>

            <input
              id="brand"
              name="brand"
              type="text"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. UrbanFit"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Original Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="₹0"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="discountPrice" className="text-sm font-medium">
                Discount Price
              </label>

              <input
                id="discountPrice"
                name="discountPrice"
                type="number"
                min="0"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="₹0"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-sm space-y-2">
            <label htmlFor="stock" className="text-sm font-medium">
              Stock Quantity
            </label>

            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="url"
                value={image}
                onChange={(event) =>
                  handleImageChange(index, event.target.value)
                }
                placeholder={`Image URL ${index + 1}`}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />

              {formData.images.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeImageField(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addImageField}>
            + Add Image
          </Button>

          <p className="text-xs text-muted-foreground">
            Add multiple image URLs for the product.
          </p>
        </CardContent>
      </Card>

      {/* Product Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Product Visibility</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={() => handleToggle("featured")}
              className="h-4 w-4 rounded border"
            />

            <div>
              <p className="text-sm font-medium">Featured Product</p>

              <p className="text-xs text-muted-foreground">
                Show this product in featured sections.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.trending}
              onChange={() => handleToggle("trending")}
              className="h-4 w-4 rounded border"
            />

            <div>
              <p className="text-sm font-medium">Trending Product</p>

              <p className="text-xs text-muted-foreground">
                Show this product in trending sections.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Error */}
      {(error || error === "") && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
