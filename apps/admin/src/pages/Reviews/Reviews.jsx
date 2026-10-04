import { MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { getReviews } from "@/features/reviews/reviewService";
import api from "@/services/api";

function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------------------
  // Fetch reviews and products
  // -----------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [reviewData, productResponse] = await Promise.all([
          getReviews(),
          api.get("/products"),
        ]);

        setReviews(reviewData);
        setProducts(productResponse.data);
      } catch (error) {
        console.error("Failed to fetch review data:", error);

        setError("Unable to load reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // -----------------------------------------
  // Get product
  // -----------------------------------------

  const getProduct = (productId) => {
    return products.find((product) => String(product.id) === String(productId));
  };

  // -----------------------------------------
  // Build products with reviews
  // -----------------------------------------

  const productsWithReviews = reviews.reduce((result, review) => {
    const productId = String(review.productId);

    if (!result[productId]) {
      result[productId] = {
        productId,
        reviews: [],
      };
    }

    result[productId].reviews.push(review);

    return result;
  }, {});

  const reviewProducts = Object.values(productsWithReviews)
    .map((item) => {
      const product = getProduct(item.productId);

      const totalRating = item.reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0,
      );

      const averageRating =
        item.reviews.length > 0 ? totalRating / item.reviews.length : 0;

      return {
        productId: item.productId,
        product,
        reviewCount: item.reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    })
    .sort((a, b) => b.reviewCount - a.reviewCount);

  // -----------------------------------------
  // Render stars
  // -----------------------------------------

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-4 ${
              star <= Math.round(rating)
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>

          <p className="text-muted-foreground">
            Manage product reviews and ratings.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading reviews...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* -------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------- */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>

        <p className="text-muted-foreground">
          Select a product to view and manage its reviews.
        </p>
      </div>

      {/* -------------------------------------- */}
      {/* Error */}
      {/* -------------------------------------- */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* -------------------------------------- */}
      {/* Summary */}
      {/* -------------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
              <MessageSquare className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>

              <p className="text-2xl font-semibold">{reviews.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
              <MessageSquare className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Products Reviewed</p>

              <p className="text-2xl font-semibold">{reviewProducts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
              <Star className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Overall Rating</p>

              <p className="text-2xl font-semibold">
                {reviews.length > 0
                  ? (
                      reviews.reduce(
                        (sum, review) => sum + Number(review.rating || 0),
                        0,
                      ) / reviews.length
                    ).toFixed(1)
                  : "0.0"}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / 5
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------- */}
      {/* Products */}
      {/* -------------------------------------- */}

      {reviewProducts.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 flex-col items-center justify-center">
            <MessageSquare className="mb-3 size-8 text-muted-foreground" />

            <p className="font-medium">No product reviews found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Products with customer reviews will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviewProducts.map((item) => {
            const product = item.product;

            const productName =
              product?.title || product?.name || `Product #${item.productId}`;

            const productImage = product?.images?.[0] || product?.image || null;

            return (
              <Card
                key={item.productId}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Product image */}

                {productImage ? (
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={productImage}
                      alt={productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                    <MessageSquare className="size-10 text-muted-foreground/50" />
                  </div>
                )}

                <CardContent className="space-y-4 p-5">
                  {/* Product name */}

                  <div>
                    <h2 className="line-clamp-1 text-lg font-semibold">
                      {productName}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Product ID: {item.productId}
                    </p>
                  </div>

                  {/* Rating */}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(item.averageRating)}

                      <span className="font-medium">
                        {item.averageRating.toFixed(1)}
                      </span>
                    </div>

                    <Badge variant="secondary">
                      {item.reviewCount}{" "}
                      {item.reviewCount === 1 ? "Review" : "Reviews"}
                    </Badge>
                  </div>

                  {/* View reviews */}

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`/reviews/${item.productId}`)}
                  >
                    <MessageSquare className="mr-2 size-4" />
                    View Reviews
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Reviews;
