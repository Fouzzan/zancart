
import api from "@/services/api";

// Get all reviews
export const getReviews = async () => {
  const response = await api.get("/reviews");
  return response.data;
};

// Get reviews for a specific product
export const getProductReviews = async (productId) => {
  const response = await api.get("/reviews");

  const reviews = response.data;

  return reviews.filter(
    (review) =>
      String(review.productId) === String(productId)
  );
};

// Get a single review
export const getReviewById = async (reviewId) => {
  const response = await api.get(
    `/reviews/${reviewId}`,
  );

  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(
    `/reviews/${reviewId}`,
  );

  return response.data;
};

// Recalculate a product's rating after
// a review has been removed.
export const recalculateProductRating = async (
  productId,
) => {
  // Get all remaining reviews for this product
  const reviews = await getProductReviews(
    productId,
  );

  const ratingCount = reviews.length;

  // No reviews remaining
  if (ratingCount === 0) {
    const response = await api.patch(
      `/products/${productId}`,
      {
        rating: 0,
        reviewCount: 0,
      },
    );

    return response.data;
  }

  // Calculate average rating
  const totalRating = reviews.reduce(
    (sum, review) =>
      sum + Number(review.rating || 0),
    0,
  );

  const averageRating =
    totalRating / ratingCount;

  // Round to one decimal place
  const roundedRating =
    Math.round(averageRating * 10) / 10;

  // Update product
  const response = await api.patch(
    `/products/${productId}`,
    {
      rating: roundedRating,
      reviewCount: ratingCount,
    },
  );

  return response.data;
};

// Delete review and recalculate
// the associated product rating.
export const deleteReviewAndUpdateProduct =
  async (review) => {
    await deleteReview(review.id);

    await recalculateProductRating(
      review.productId,
    );

    return true;
  };

