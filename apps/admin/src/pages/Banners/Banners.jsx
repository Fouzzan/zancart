import {
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import {
  deleteBanner,
  getBanners,
  updateBanner,
} from "@/features/banners/bannerServices";

function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);

      const data = await getBanners();

      const sortedBanners = [...data].sort(
        (a, b) => Number(a.order) - Number(b.order),
      );

      setBanners(sortedBanners);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteBanner(deleteTarget.id);

      setBanners((prev) =>
        prev.filter((banner) => banner.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete banner:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      setUpdatingStatus(banner.id);

      const updatedBanner = await updateBanner(banner.id, {
        isActive: !banner.isActive,
        updatedAt: new Date().toISOString(),
      });

      setBanners((prev) =>
        prev.map((item) =>
          item.id === banner.id ? { ...item, ...updatedBanner } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update banner status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Banner Management
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage the banners displayed on your ZanCart storefront.
          </p>
        </div>

        <Button
          onClick={() => {
            window.location.href = "/banners/create";
          }}
        >
          <Plus className="mr-2 size-4" />
          Add Banner
        </Button>
      </div>

      {/* Banner Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            Banners
            {!loading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({banners.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="size-7 animate-spin text-muted-foreground" />
            </div>
          ) : banners.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <ImageIcon className="size-8 text-muted-foreground" />
              </div>

              <h3 className="font-semibold">No banners found</h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first banner to display promotional content on the
                ZanCart storefront.
              </p>

              <Button
                className="mt-4"
                onClick={() => {
                  window.location.href = "/banners/create";
                }}
              >
                <Plus className="mr-2 size-4" />
                Add Banner
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex flex-col gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30 lg:flex-row lg:items-center"
                >
                  {/* Banner Preview */}
                  <div className="relative aspect-[16/5] w-full overflow-hidden rounded-lg bg-muted lg:w-[360px] lg:shrink-0">
                    <img
                      src={banner.image}
                      alt={banner.alt || "ZanCart banner"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute left-2 top-2">
                      <Badge variant="secondary">#{banner.order}</Badge>
                    </div>
                  </div>

                  {/* Banner Information */}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Banner ID
                      </p>

                      <p className="truncate font-mono text-sm">{banner.id}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Link
                      </p>

                      <p className="truncate text-sm">
                        {banner.link || "No link"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={banner.isActive ? "default" : "secondary"}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>

                      <Badge variant="outline">Order: {banner.order}</Badge>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 lg:px-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">Active</p>

                      <p className="text-xs text-muted-foreground">
                        {banner.isActive ? "Visible" : "Hidden"}
                      </p>
                    </div>

                    {updatingStatus === banner.id ? (
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch
                        checked={Boolean(banner.isActive)}
                        onCheckedChange={() => handleToggleStatus(banner)}
                        aria-label={`Toggle ${banner.id} status`}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:border-l lg:pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/banners/edit/${banner.id}`;
                      }}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(banner)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The banner will be permanently
              removed from your banner management list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Banners;
