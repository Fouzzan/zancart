import api from "./api";

export const getUserWishlist = async (userId) => {
  const response = await api.get(`/wishlists?userId=${userId}`);

  return response.data[0] || null;
};

export const createUserWishlist = async (userId, items = []) => {
  const response = await api.post("/wishlists", {
    userId,
    items,
  });

  return response.data;
};

export const updateUserWishlist = async (wishlistId, items) => {
  const response = await api.patch(`/wishlists/${wishlistId}`, {
    items,
  });

  return response.data;
};