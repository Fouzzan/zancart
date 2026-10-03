import api from "./api";
import {
  getProductById,
  updateProductStock,
} from "./productServices";

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
  // 1. Get the latest order
  const orderResponse = await api.get(`/orders/${orderId}`);
  const order = orderResponse.data;

  // 2. Prevent duplicate cancellation
  if (order.status === "cancelled") {
    throw new Error("This order has already been cancelled.");
  }

  // 3. Only placed and processing orders can be cancelled
  if (
    order.status !== "placed" &&
    order.status !== "processing"
  ) {
    throw new Error(
      `Orders in "${order.status}" status cannot be cancelled.`,
    );
  }

  // 4. Get the latest product data
  const products = await Promise.all(
    order.items.map((item) =>
      getProductById(item.productId),
    ),
  );

  // 5. Restore stock
  const restoredProducts = [];

  try {
    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const item = order.items[index];

      const currentStock = Number(product.stock);
      const quantityToRestore = Number(item.quantity);

      const newStock =
        currentStock + quantityToRestore;

      const updatedProduct = await updateProductStock(
        product.id,
        newStock,
      );

      restoredProducts.push({
        productId: product.id,
        previousStock: currentStock,
        updatedStock: newStock,
      });
    }

    // 6. Only mark the order cancelled AFTER stock is restored
    const response = await api.patch(
      `/orders/${orderId}`,
      {
        status: "cancelled",
      },
    );

    return response.data;
  } catch (error) {
    // Roll back stock if cancellation fails
    for (const product of restoredProducts) {
      try {
        await updateProductStock(
          product.productId,
          product.previousStock,
        );
      } catch (rollbackError) {
        console.error(
          "Failed to rollback restored stock:",
          rollbackError,
        );
      }
    }

    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  const response = await api.delete(`/orders/${orderId}`);
  return response.data;
};