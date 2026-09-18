import api from "./api";

export const getUserCart = async (userId) => {
  const response = await api.get(`/carts?userId=${userId}`);

  return response.data[0] || null;
};

export const createUserCart = async (userId, items = []) => {
  const response = await api.post("/carts", {
    userId,
    items,
  });

  return response.data;
};

export const updateUserCart = async (cartId, items) => {
  const response = await api.patch(`/carts/${cartId}`, {
    items,
  });

  return response.data;
};