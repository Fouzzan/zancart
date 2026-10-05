import { ArrowLeft, ImageIcon, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.image.trim()) {
      setError("Banner image URL is required.");
      return;
    }

    if (!formData.link.trim()) {
      setError("Banner link is required.");
      return;
    }

    if (!formData.order || Number(formData.order) < 1) {
      setError("Display order must be at least 1.");
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
    } catch (err) {
      console.error("Failed to create banner:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create banner. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/banners")}
          aria-label="Back to banners"
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
              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image">Banner Image URL</Label>

                <Input
                  id="image"
                  name="image"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={formData.image}
                  onChange={handleChange}
                  disabled={loading}
                />

                <p className="text-xs text-muted-foreground">
                  Use a publicly accessible image URL.
                </p>
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Banner Link</Label>

                <Input
                  id="link"
                  name="link"
                  type="text"
                  placeholder="/products"
                  value={formData.link}
                  onChange={handleChange}
                  disabled={loading}
                />

                <p className="text-xs text-muted-foreground">
                  Example: /products or /products?category=Fashion
                </p>
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>

                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.order}
                  onChange={handleChange}
                  disabled={loading}
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
                    setFormData((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
                  disabled={loading}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/banners")}
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
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
              <CardTitle>Preview</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-xl border bg-muted">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Banner preview"
                    className="aspect-[16/5] w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex aspect-[16/5] flex-col items-center justify-center text-center text-muted-foreground">
                    <ImageIcon className="mb-3 size-10" />

                    <p className="text-sm font-medium">Banner preview</p>

                    <p className="mt-1 text-xs">
                      Enter an image URL to see the preview.
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
