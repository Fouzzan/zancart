
import api from "./api";

// --------------------------------------------------
// Constants
// --------------------------------------------------

const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 500;

// --------------------------------------------------
// Get all reviews for a product
// --------------------------------------------------

export const getProductReviews = async (productId) => {
  const response = await api.get("/reviews");

  return response.data.filter(
    (review) =>
      String(review.productId) === String(productId),
  );
};

// --------------------------------------------------
// Get reviews by user
// --------------------------------------------------

export const getUserReviews = async (userId) => {
  const response = await api.get("/reviews");

  return response.data.filter(
    (review) => review.userId === userId,
  );
};

// --------------------------------------------------
// Get a user's review for a specific product
// --------------------------------------------------

export const getUserProductReview = async (
  userId,
  productId,
) => {
  const reviews = await getProductReviews(productId);

  return (
    reviews.find(
      (review) => review.userId === userId,
    ) || null
  );
};

// --------------------------------------------------
// Validate review data
// --------------------------------------------------

const validateReview = ({
  productId,
  userId,
  rating,
  comment,
}) => {
  if (!productId) {
    throw new Error("Product is required.");
  }

  if (!userId) {
    throw new Error("User is required.");
  }

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new Error(
      "Rating must be between 1 and 5.",
    );
  }

  if (
    typeof comment !== "string" ||
    !comment.trim()
  ) {
    throw new Error("Review comment is required.");
  }

  const trimmedComment = comment.trim();

  if (
    trimmedComment.length <
    MIN_COMMENT_LENGTH
  ) {
    throw new Error(
      `Review must contain at least ${MIN_COMMENT_LENGTH} characters.`,
    );
  }

  if (
    trimmedComment.length >
    MAX_COMMENT_LENGTH
  ) {
    throw new Error(
      `Review cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
    );
  }

  return {
    rating: numericRating,
    comment: trimmedComment,
  };
};

// --------------------------------------------------
// Check whether the user purchased the product
// --------------------------------------------------

const hasPurchasedProduct = async (
  userId,
  productId,
) => {
  const response = await api.get(
    `/orders?userId=${userId}`,
  );

  const orders = response.data;

  return orders.some((order) => {
    // Cancelled orders should not qualify.
    if (order.status === "cancelled") {
      return false;
    }

    return order.items?.some(
      (item) =>
        String(item.productId) ===
        String(productId),
    );
  });
};

// --------------------------------------------------
// Recalculate product rating
// --------------------------------------------------

export const recalculateProductRating = async (
  productId,
) => {
  const reviews =
    await getProductReviews(productId);

  const reviewCount = reviews.length;

  const totalRating = reviews.reduce(
    (total, review) =>
      total + Number(review.rating || 0),
    0,
  );

  const rating =
    reviewCount === 0
      ? 0
      : Number(
          (totalRating / reviewCount).toFixed(1),
        );

  const response = await api.patch(
    `/products/${productId}`,
    {
      rating,
      reviewCount,
    },
  );

  return response.data;
};

// --------------------------------------------------
// Create review
// --------------------------------------------------

export const createReview = async (review) => {
  const {
    productId,
    userId,
    rating,
    comment,
  } = review;

  // Validate review
  const validated = validateReview({
    productId,
    userId,
    rating,
    comment,
  });

  // Make sure product exists
  try {
    await api.get(`/products/${productId}`);
  } catch {
    throw new Error(
      "This product no longer exists.",
    );
  }

  // Make sure user has purchased product
  const purchased =
    await hasPurchasedProduct(
      userId,
      productId,
    );

  if (!purchased) {
    throw new Error(
      "You can only review products you have purchased.",
    );
  }

  // Prevent duplicate reviews
  const existingReview =
    await getUserProductReview(
      userId,
      productId,
    );

  if (existingReview) {
    throw new Error(
      "You have already reviewed this product.",
    );
  }

  // Create review
  const response = await api.post(
    "/reviews",
    {
      ...review,
      productId: String(productId),
      userId,
      rating: validated.rating,
      comment: validated.comment,
      createdAt:
        review.createdAt ||
        new Date().toISOString(),
    },
  );

  // Synchronize product aggregate
  await recalculateProductRating(
    productId,
  );

  return response.data;
};

// --------------------------------------------------
// Update review
// --------------------------------------------------

export const updateReview = async (
  reviewId,
  reviewData,
) => {
  // Get existing review first
  const existingResponse =
    await api.get(`/reviews/${reviewId}`);

  const existingReview =
    existingResponse.data;

  const validated = validateReview({
    productId: existingReview.productId,
    userId: existingReview.userId,
    rating: reviewData.rating,
    comment: reviewData.comment,
  });

  // Update review
  const response = await api.patch(
    `/reviews/${reviewId}`,
    {
      rating: validated.rating,
      comment: validated.comment,
      updatedAt:
        new Date().toISOString(),
    },
  );

  // Recalculate product aggregate
  await recalculateProductRating(
    existingReview.productId,
  );

  return response.data;
};

// --------------------------------------------------
// Delete review
// --------------------------------------------------

export const deleteReview = async (
  reviewId,
) => {
  // Get review before deleting it
  const response = await api.get(
    `/reviews/${reviewId}`,
  );

  const review = response.data;

  // Delete review
  await api.delete(
    `/reviews/${reviewId}`,
  );

  // Recalculate product aggregate
  await recalculateProductRating(
    review.productId,
  );

  return review;
};

// --------------------------------------------------
// Order helper
// --------------------------------------------------

export const getUserOrders = async (
  userId,
) => {
  const response = await api.get(
    `/orders?userId=${userId}`,
  );

  return response.data;
};

