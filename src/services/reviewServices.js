import api from "./api";

export const getProductReviews = async (productId) => {
  const response = await api.get("/reviews");

  console.log("All reviews from server:", response.data);
  console.log("Current product ID:", productId);

  const filteredReviews = response.data.filter(
    (review) =>
      String(review.productId) === String(productId)
  );

  console.log("Filtered reviews:", filteredReviews);

  return filteredReviews;
};

export const getUserReviews = async (userId) => {
  const response = await api.get(`/reviews?userId=${userId}`);
  return response.data;
};

export const createReview = async (review) => {
  const response = await api.post("/reviews", review);
  return response.data;
};

export const updateReview = async (reviewId, review) => {
  const response = await api.patch(`/reviews/${reviewId}`, review);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  await api.delete(`/reviews/${reviewId}`);
};

export const getUserOrders = async (userId) => {
  const response = await api.get(`/orders?userId=${userId}`);
  return response.data;
};