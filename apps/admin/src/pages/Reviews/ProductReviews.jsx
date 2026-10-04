import { ArrowLeft, MessageSquare, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  deleteReviewAndUpdateProduct,
  getProductReviews,
} from "@/features/reviews/reviewService";

import api from "@/services/api";

function ProductReviews() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // -----------------------------------------
  // Fetch product + reviews
  // -----------------------------------------

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productResponse, reviewData] = await Promise.all([
        api.get(`/products/${productId}`),
        getProductReviews(productId),
      ]);

      setProduct(productResponse.data);
      setReviews(reviewData);
    } catch (error) {
      console.error("Failed to fetch product reviews:", error);

      setError("Unable to load product reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  // -----------------------------------------
  // Delete review
  // -----------------------------------------

  const handleDelete = async (review) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this review?\n\nThe product rating will be recalculated.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(review.id);
      setError("");

      await deleteReviewAndUpdateProduct(review);

      // Remove from current list immediately
      setReviews((currentReviews) =>
        currentReviews.filter((item) => item.id !== review.id),
      );

      // Fetch the updated product
      const productResponse = await api.get(`/products/${productId}`);

      setProduct(productResponse.data);
    } catch (error) {
      console.error("Failed to delete review:", error);

      setError("Failed to remove the review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------------------
  // Format date
  // -----------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // -----------------------------------------
  // Render stars
  // -----------------------------------------

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-5 ${
              star <= numericRating
                ? "fill-current text-yellow-500"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------

  if (error && !product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/reviews")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Reviews
        </Button>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // Calculate current rating from reviews
  // -----------------------------------------

  const calculatedRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      : 0;

  const averageRating = Math.round(calculatedRating * 10) / 10;

  const productName =
    product?.title || product?.name || `Product #${productId}`;

  const productImage = product?.images?.[0] || product?.image || null;

  return (
    <div className="space-y-6">
      {/* -------------------------------------- */}
      {/* Back */}
      {/* -------------------------------------- */}

      <Button
        variant="ghost"
        className="-ml-2"
        onClick={() => navigate("/reviews")}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Reviews
      </Button>

      {/* -------------------------------------- */}
      {/* Product Header */}
      {/* -------------------------------------- */}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Product image */}

            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="size-24 rounded-lg object-cover"
              />
            ) : (
              <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-muted">
                <MessageSquare className="size-8 text-muted-foreground" />
              </div>
            )}

            {/* Product information */}

            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Product Reviews</p>

              <h1 className="mt-1 text-2xl font-bold">{productName}</h1>

              <p className="mt-1 text-xs text-muted-foreground">
                Product ID: {productId}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  {renderStars(averageRating)}

                  <span className="font-semibold">
                    {averageRating.toFixed(1)}
                  </span>

                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>

                <Badge variant="secondary">
                  {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------- */}
      {/* Error */}
      {/* -------------------------------------- */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* -------------------------------------- */}
      {/* Reviews */}
      {/* -------------------------------------- */}

      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>

        <CardContent>
          {reviews.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed">
              <MessageSquare className="mb-3 size-8 text-muted-foreground" />

              <p className="font-medium">No reviews remaining</p>

              <p className="mt-1 text-sm text-muted-foreground">
                This product currently has no customer reviews.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((review) => (
                <div key={review.id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Review content */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold">
                          {review.userName || "Unknown User"}
                        </p>

                        <Badge variant="secondary">{review.rating}/5</Badge>
                      </div>

                      <div className="mt-2">{renderStars(review.rating)}</div>

                      <p className="mt-3 leading-relaxed text-sm">
                        {review.comment || "No comment provided."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>User ID: {review.userId}</span>

                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>

                    {/* Delete */}

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === review.id}
                      className="shrink-0 self-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(review)}
                    >
                      <Trash2 className="mr-2 size-4" />

                      {deletingId === review.id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductReviews;
