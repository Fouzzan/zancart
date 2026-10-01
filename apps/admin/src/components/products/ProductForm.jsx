import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  categories = [],
  brands = [],
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

  const handleCategoryChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      category: value,
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
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="title">Product Name</Label>

            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter product name"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>

            <Textarea
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="resize-none"
              disabled={loading}
            />
          </div>

          {/* Category + Subcategory */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>

              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
                disabled={loading}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>

                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>

              <Input
                id="subcategory"
                name="subcategory"
                type="text"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="e.g. T-Shirts"
                disabled={loading}
              />
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>

            <Select
              value={formData.brand}
              onValueChange={(value) =>
                setFormData((previous) => ({
                  ...previous,
                  brand: value,
                }))
              }
            >
              <SelectTrigger className="w-[49%]">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>

              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {/* Original Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Original Price</Label>

              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="₹0"
                disabled={loading}
              />
            </div>

            {/* Discount Price */}
            <div className="space-y-2">
              <Label htmlFor="discountPrice">Discount Price</Label>

              <Input
                id="discountPrice"
                name="discountPrice"
                type="number"
                min="0"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="₹0"
                disabled={loading}
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
          <div className="max-w-[49%] space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>

            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              disabled={loading}
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
              <Input
                type="url"
                value={image}
                onChange={(event) =>
                  handleImageChange(index, event.target.value)
                }
                placeholder={`Image URL ${index + 1}`}
                disabled={loading}
              />

              {formData.images.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeImageField(index)}
                  disabled={loading}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addImageField}
            disabled={loading}
          >
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
          {/* Featured */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={() => handleToggle("featured")}
              disabled={loading}
            />

            <div className="space-y-1">
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Product
              </Label>

              <p className="text-xs text-muted-foreground">
                Show this product in featured sections.
              </p>
            </div>
          </div>

          {/* Trending */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="trending"
              checked={formData.trending}
              onCheckedChange={() => handleToggle("trending")}
              disabled={loading}
            />

            <div className="space-y-1">
              <Label htmlFor="trending" className="cursor-pointer">
                Trending Product
              </Label>

              <p className="text-xs text-muted-foreground">
                Show this product in trending sections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

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
