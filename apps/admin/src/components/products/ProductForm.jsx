import { useState } from "react";

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

import { uploadProductImage } from "@/features/products/imageUploadService";

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

const MAX_IMAGES = 10;

function ProductForm({
  initialData = emptyProduct,
  onSubmit,
  loading = false,
  error = "",
  submitLabel = "Save Product",
  categories = [],
  brands = [],
}) {
  const [formData, setFormData] = useState(() => ({
    ...emptyProduct,
    ...initialData,
    images: initialData?.images?.length > 0 ? initialData.images : [""],
  }));

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

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

  const handleToggle = (name) => {
    setFormData((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  };

  const removeImageField = (index) => {
    setFormData((previous) => {
      const updatedImages = previous.images.filter(
        (_, imageIndex) => imageIndex !== index,
      );

      return {
        ...previous,
        images: updatedImages.length > 0 ? updatedImages : [""],
      };
    });

    setUploadError("");
    setUploadProgress("");
  };

  const handleFileSelection = async (event) => {
    const files = Array.from(event.target.files || []);

    // Allow selecting the same file again later.
    event.target.value = "";

    if (files.length === 0) return;

    const existingImages = formData.images.filter(
      (image) => typeof image === "string" && image.trim(),
    );

    if (existingImages.length + files.length > MAX_IMAGES) {
      setUploadError(
        `You can upload a maximum of ${MAX_IMAGES} images per product.`,
      );
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      setUploadError(`${invalidFile.name} is not a valid image file.`);
      return;
    }

    setUploadingImages(true);
    setUploadError("");
    setUploadProgress("");

    const uploadedUrls = [];

    try {
      for (let index = 0; index < files.length; index += 1) {
        setUploadProgress(`Uploading image ${index + 1} of ${files.length}...`);

        const imageUrl = await uploadProductImage(files[index]);
        uploadedUrls.push(imageUrl);

        // Add each successful upload immediately so it is not
        // lost if a later image in the batch fails.
        setFormData((previous) => ({
          ...previous,
          images: [
            ...previous.images.filter(
              (image) => typeof image === "string" && image.trim(),
            ),
            imageUrl,
          ],
        }));
      }

      setUploadProgress(
        `${uploadedUrls.length} image(s) uploaded successfully.`,
      );
    } catch (uploadFailure) {
      console.error("Product image upload failed:", uploadFailure);

      setUploadError(
        uploadFailure.response?.data?.message ||
          uploadFailure.message ||
          "Unable to upload images. Please try again.",
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (uploadingImages) {
      onSubmit(null, "Please wait for image uploads to finish.");
      return;
    }

    const cleanedImages = formData.images
      .map((image) => image.trim())
      .filter(Boolean);

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      formData.price === "" ||
      formData.discountPrice === "" ||
      !formData.category.trim() ||
      !formData.subcategory.trim() ||
      !formData.brand.trim() ||
      formData.stock === "" ||
      cleanedImages.length === 0
    ) {
      onSubmit(
        null,
        "Please fill in all required fields and add at least one image.",
      );
      return;
    }

    if (cleanedImages.length > MAX_IMAGES) {
      onSubmit(null, `A product can have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    if (
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      onSubmit(null, "Price must be greater than 0.");
      return;
    }

    if (
      !Number.isFinite(Number(formData.discountPrice)) ||
      Number(formData.discountPrice) <= 0
    ) {
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

    if (
      !Number.isFinite(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
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
      featured: Boolean(formData.featured),
      trending: Boolean(formData.trending),
      rating: formData.rating ?? 0,
      reviewCount: formData.reviewCount ?? 0,
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

          <div className="grid gap-4 sm:grid-cols-2">
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
              disabled={loading}
            >
              <SelectTrigger id="brand" className="w-full sm:w-[49%]">
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
            <div className="space-y-2">
              <Label htmlFor="price">Original Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="₹0"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">Discount Price</Label>
              <Input
                id="discountPrice"
                name="discountPrice"
                type="number"
                min="0"
                step="0.01"
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
              step="1"
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
          <div className="space-y-2">
            <Label htmlFor="product-images">Upload images</Label>
            <Input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelection}
              disabled={loading || uploadingImages}
            />

            <p className="text-xs text-muted-foreground">
              Select up to {MAX_IMAGES} images in total. Images are compressed
              before upload.
            </p>
          </div>

          {uploadingImages && (
            <p className="text-sm text-muted-foreground" role="status">
              {uploadProgress}
            </p>
          )}

          {uploadError && (
            <p className="text-sm text-destructive" role="alert">
              {uploadError}
            </p>
          )}

          {!uploadingImages && uploadProgress && !uploadError && (
            <p className="text-sm text-muted-foreground" role="status">
              {uploadProgress}
            </p>
          )}

          {formData.images.filter(Boolean).length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {formData.images
                .map((url, index) => ({ url, index }))
                .filter(({ url }) => Boolean(url?.trim()))
                .map(({ url, index }) => (
                  <div key={`${url}-${index}`} className="space-y-2">
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      loading="lazy"
                      className="h-36 w-full rounded-md border object-cover"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => removeImageField(index)}
                      disabled={loading || uploadingImages}
                    >
                      Remove image
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Product Visibility</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="featured"
              checked={Boolean(formData.featured)}
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

          <div className="flex items-start gap-3">
            <Checkbox
              id="trending"
              checked={Boolean(formData.trending)}
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

      {/* Form Error */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading || uploadingImages}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading || uploadingImages}>
          {uploadingImages
            ? "Uploading images..."
            : loading
              ? "Saving..."
              : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
