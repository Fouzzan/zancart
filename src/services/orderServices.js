import api from "./api";

export const createOrder = async (order) => {
  const response = await api.post("/orders", order);
  return response.data;
};

export const getUserOrders = async (userId) => {
  const response = await api.get(`/orders?userId=${userId}`);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}`, {
    status: "cancelled",
  });

  return response.data;
};