import api from "./api";

// Get a product by ID
export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

// Update only the stock of a product
export const updateProductStock = async (productId, stock) => {
  const response = await api.patch(`/products/${productId}`, {
    stock,
  });

  return response.data;
};

// Check whether all products have enough stock
export const validateOrderStock = async (items) => {
  const products = await Promise.all(
    items.map((item) => getProductById(item.productId)),
  );

  const insufficientItems = [];

  products.forEach((product, index) => {
    const item = items[index];

    const availableStock = Number(product.stock);
    const requestedQuantity = Number(item.quantity);

    if (availableStock < requestedQuantity) {
      insufficientItems.push({
        productId: product.id,
        title: product.title,
        available: availableStock,
        requested: requestedQuantity,
      });
    }
  });

  return {
    valid: insufficientItems.length === 0,
    insufficientItems,
  };
};

// Reduce stock for every item in the order
export const reduceOrderStock = async (items) => {
  // Get the latest product data
  const products = await Promise.all(
    items.map((item) => getProductById(item.productId)),
  );

  // Validate everything before changing anything
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const item = items[index];

    const availableStock = Number(product.stock);
    const requestedQuantity = Number(item.quantity);

    if (availableStock < requestedQuantity) {
      throw new Error(
        `"${product.title}" has only ${availableStock} item(s) left in stock.`,
      );
    }
  }

  const updatedProducts = [];

  try {
    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const item = items[index];

      const newStock =
        Number(product.stock) - Number(item.quantity);

      const updatedProduct = await updateProductStock(
        product.id,
        newStock,
      );

      updatedProducts.push({
        productId: product.id,
        previousStock: Number(product.stock),
        updatedStock: newStock,
        product: updatedProduct,
      });
    }

    return updatedProducts;
  } catch (error) {
    // Roll back any products that were already updated
    for (const updated of updatedProducts) {
      try {
        await updateProductStock(
          updated.productId,
          updated.previousStock,
        );
      } catch (rollbackError) {
        console.error(
          "Failed to rollback stock:",
          rollbackError,
        );
      }
    }

    throw error;
  }
};

// Restore stock if order creation fails after stock was reduced
export const restoreOrderStock = async (stockUpdates) => {
  for (const update of stockUpdates) {
    await updateProductStock(
      update.productId,
      update.previousStock,
    );
  }
};