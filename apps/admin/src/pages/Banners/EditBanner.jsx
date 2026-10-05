import { ArrowLeft, ImageIcon, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { getBannerById, updateBanner } from "@/features/banners/bannerServices";

function EditBanner() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    image: "",
    link: "",
    order: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        setError("");

        const banner = await getBannerById(id);

        setFormData({
          image: banner.image || "",
          link: banner.link || "",
          order: banner.order ?? "",
          isActive: Boolean(banner.isActive),
        });
      } catch (err) {
        console.error("Failed to fetch banner:", err);
        setError("Failed to load banner. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBanner();
    }
  }, [id]);

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
      setSaving(true);

      await updateBanner(id, {
        image: formData.image.trim(),
        link: formData.link.trim(),
        order: Number(formData.order),
        isActive: formData.isActive,
        updatedAt: new Date().toISOString(),
      });

      navigate("/banners");
    } catch (err) {
      console.error("Failed to update banner:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update banner. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !formData.image && !formData.link) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
            <p className="font-medium">Unable to load banner</p>

            <p className="mt-1 text-sm text-muted-foreground">{error}</p>

            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate("/banners")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Banners
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Banner</h1>

          <p className="mt-1 text-muted-foreground">
            Update this banner's image, link, order, or status.
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
              {/* Image */}
              <div className="space-y-2">
                <Label htmlFor="image">Banner Image URL</Label>

                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="https://example.com/banner.jpg"
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
                  value={formData.link}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="/products"
                />

                <p className="text-xs text-muted-foreground">
                  Example: /products?category=Fashion
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
                  value={formData.order}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="1"
                />

                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in the carousel.
                </p>
              </div>

              {/* Active */}
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
                  disabled={saving}
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
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Save Changes
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
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default EditBanner;
