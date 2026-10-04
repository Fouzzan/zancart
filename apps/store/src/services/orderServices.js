
import api from "./api";
import {
  getProductById,
  updateProductStock,
} from "./productServices";

// ============================================================
// Create Order
// ============================================================
export const createOrder = async (order) => {
  const response = await api.post(
    "/orders",
    order,
  );

  return response.data;
};

// ============================================================
// Get User Orders
// ============================================================
export const getUserOrders = async (userId) => {
  const response = await api.get(
    `/orders?userId=${userId}`,
  );

  return response.data;
};

// ============================================================
// Get Single Order
// ============================================================
export const getOrderById = async (orderId) => {
  const response = await api.get(
    `/orders/${orderId}`,
  );

  return response.data;
};

// ============================================================
// Helper: Get actual inventory quantity
// ============================================================
//
// Normal product:
// quantity = 2
// → restore 2
//
// BOGO:
// paidQuantity = 1
// freeQuantity = 1
// → restore 2
//
// Buy 2 Get 1:
// paidQuantity = 2
// freeQuantity = 1
// → restore 3
//
// Bundle:
// The bundle does NOT add extra stock here because the
// bundle uses the products that are already present in
// order.items.
//
// ============================================================
const getOrderStockQuantity = (item) => {
  const paidQuantity = Number(
    item.paidQuantity ??
      item.quantity ??
      0,
  );

  const freeQuantity = Number(
    item.freeQuantity ?? 0,
  );

  return paidQuantity + freeQuantity;
};

// ============================================================
// Cancel Order
// ============================================================
//
// Steps:
//
// 1. Get latest order
// 2. Validate cancellation
// 3. Get latest product stock
// 4. Restore actual inventory quantity
// 5. Mark order as cancelled
// 6. Roll back stock if cancellation fails
//
// ============================================================
export const cancelOrder = async (orderId) => {
  // ----------------------------------------------------------
  // 1. Get latest order
  // ----------------------------------------------------------
  const orderResponse = await api.get(
    `/orders/${orderId}`,
  );

  const order = orderResponse.data;

  // ----------------------------------------------------------
  // 2. Prevent duplicate cancellation
  // ----------------------------------------------------------
  if (order.status === "cancelled") {
    throw new Error(
      "This order has already been cancelled.",
    );
  }

  // ----------------------------------------------------------
  // 3. Only placed and processing orders can be cancelled
  // ----------------------------------------------------------
  if (
    order.status !== "placed" &&
    order.status !== "processing"
  ) {
    throw new Error(
      `Orders in "${order.status}" status cannot be cancelled.`,
    );
  }

  // ----------------------------------------------------------
  // Safety check
  // ----------------------------------------------------------
  if (
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    throw new Error(
      "This order has no items to restore.",
    );
  }

  // ----------------------------------------------------------
  // 4. Get latest product data
  // ----------------------------------------------------------
  const products = await Promise.all(
    order.items.map((item) =>
      getProductById(item.productId),
    ),
  );

  // ----------------------------------------------------------
  // 5. Restore stock
  // ----------------------------------------------------------
  const restoredProducts = [];

  try {
    for (
      let index = 0;
      index < products.length;
      index++
    ) {
      const product = products[index];
      const item = order.items[index];

      const currentStock = Number(
        product.stock,
      );

      // Important:
      // Restore both paid + free quantities.
      //
      // Example:
      // BOGO → paid 1 + free 1 = restore 2
      //
      const quantityToRestore =
        getOrderStockQuantity(item);

      if (quantityToRestore <= 0) {
        continue;
      }

      const newStock =
        currentStock +
        quantityToRestore;

      const updatedProduct =
        await updateProductStock(
          product.id,
          newStock,
        );

      restoredProducts.push({
        productId: product.id,

        previousStock:
          currentStock,

        updatedStock:
          newStock,

        quantityRestored:
          quantityToRestore,

        product:
          updatedProduct,
      });
    }

    // --------------------------------------------------------
    // 6. Only mark order cancelled AFTER stock is restored
    // --------------------------------------------------------
    const response = await api.patch(
      `/orders/${orderId}`,
      {
        status: "cancelled",
      },
    );

    return response.data;
  } catch (error) {
    // --------------------------------------------------------
    // Roll back stock if cancellation fails
    // --------------------------------------------------------
    //
    // Example:
    //
    // Product A restored successfully
    // Product B restoration fails
    // Order cancellation fails
    //
    // Restore Product A back to its original stock.
    //
    for (
      const product of restoredProducts
    ) {
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

// ============================================================
// Delete Order
// ============================================================
export const deleteOrder = async (orderId) => {
  const response = await api.delete(
    `/orders/${orderId}`,
  );

  return response.data;
};
