import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { uploadProductImage } from "@/features/products/imageUploadService";
import { createBanner } from "@/features/banners/bannerServices";

function CreateBanner() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    image: "",
    link: "/products",
    order: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");
    setUploadMessage("");
    setUploading(true);

    try {
      const imageUrl = await uploadProductImage(file, "zancart/banners");

      setFormData((previous) => ({
        ...previous,
        image: imageUrl,
      }));

      setUploadMessage("Banner image uploaded successfully.");
    } catch (uploadError) {
      console.error("Banner image upload failed:", uploadError);

      setError(
        uploadError.response?.data?.message ||
          uploadError.message ||
          "Failed to upload banner image.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));

    setUploadMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (uploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    if (!formData.image.trim()) {
      setError("Please upload a banner image.");
      return;
    }

    if (!formData.link.trim()) {
      setError("Banner link is required.");
      return;
    }

    if (
      formData.order === "" ||
      !Number.isInteger(Number(formData.order)) ||
      Number(formData.order) < 1
    ) {
      setError("Display order must be a whole number of at least 1.");
      return;
    }

    try {
      setLoading(true);

      const now = new Date().toISOString();

      await createBanner({
        image: formData.image.trim(),
        link: formData.link.trim(),
        order: Number(formData.order),
        isActive: formData.isActive,
        createdAt: now,
        updatedAt: now,
      });

      navigate("/banners");
    } catch (submitError) {
      console.error("Failed to create banner:", submitError);

      setError(
        submitError?.response?.data?.message ||
          "Failed to create banner. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || uploading;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/banners")}
          aria-label="Back to banners"
          disabled={busy}
        >
          <ArrowLeft className="size-5" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Banner</h1>

          <p className="mt-1 text-muted-foreground">
            Create a new promotional banner for the ZanCart storefront.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Banner Details */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label htmlFor="banner-image">Banner Image</Label>

                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Upload className="size-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Upload your banner image
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Your image will be compressed and uploaded to
                        Cloudinary.
                      </p>
                    </div>

                    <Input
                      id="banner-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={busy}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {uploading && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Compressing and uploading banner...
                  </p>
                )}

                {uploadMessage && !uploading && (
                  <p className="text-sm text-green-600">{uploadMessage}</p>
                )}

                {formData.image && (
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-lg border">
                      <img
                        src={formData.image}
                        alt="Uploaded banner"
                        className="aspect-[16/5] w-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 break-all text-xs text-muted-foreground">
                        {formData.image}
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Remove banner image"
                        onClick={handleRemoveImage}
                        disabled={busy}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Banner Link</Label>

                <Input
                  id="link"
                  name="link"
                  type="text"
                  placeholder="/products"
                  value={formData.link}
                  onChange={handleChange}
                  disabled={busy}
                />

                <p className="text-xs text-muted-foreground">
                  Example: /products or /products?category=Fashion
                </p>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>

                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={formData.order}
                  onChange={handleChange}
                  disabled={busy}
                />

                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in the carousel.
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label htmlFor="isActive">Active Banner</Label>

                  <p className="text-xs text-muted-foreground">
                    Active banners are displayed on the storefront.
                  </p>
                </div>

                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((previous) => ({
                      ...previous,
                      isActive: checked,
                    }))
                  }
                  disabled={busy}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/banners")}
                  disabled={busy}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={busy}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Create Banner
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Preview</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-xl border bg-muted">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Banner preview"
                    className="aspect-[16/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/5] flex-col items-center justify-center text-center text-muted-foreground">
                    <ImageIcon className="mb-3 size-10" />

                    <p className="text-sm font-medium">Banner preview</p>

                    <p className="mt-1 text-xs">
                      Upload an image to preview your banner.
                    </p>
                  </div>
                )}
              </div>

              {formData.image && (
                <p className="mt-3 break-all text-xs text-muted-foreground">
                  {formData.image}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default CreateBanner;
