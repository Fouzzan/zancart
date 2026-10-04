
import api from "./api";

// ============================================================
// Helper: Calculate the actual quantity leaving inventory
// ============================================================
//
// Normal product:
// quantity = 2
// → stock quantity = 2
//
// BOGO:
// paidQuantity = 1
// freeQuantity = 1
// → stock quantity = 2
//
// Buy 2 Get 1:
// paidQuantity = 2
// freeQuantity = 1
// → stock quantity = 3
//
// Bundle:
// The bundle quantity is handled separately through
// appliedDeals.bundles.productQuantities.
// ============================================================
const getItemStockQuantity = (item) => {
  const paidQuantity = Number(
    item.paidQuantity ?? item.quantity ?? 0,
  );

  const freeQuantity = Number(
    item.freeQuantity ?? 0,
  );

  return paidQuantity + freeQuantity;
};

// ============================================================
// Get a product by ID
// ============================================================
export const getProductById = async (productId) => {
  const response = await api.get(
    `/products/${productId}`,
  );

  return response.data;
};

// ============================================================
// Update only the stock of a product
// ============================================================
export const updateProductStock = async (
  productId,
  stock,
) => {
  const response = await api.patch(
    `/products/${productId}`,
    {
      stock,
    },
  );

  return response.data;
};

// ============================================================
// Build total stock requirements
// ============================================================
//
// This combines:
//
// 1. Normal / product-level deal quantities
// 2. Bundle quantities
//
// Example:
//
// Product 1:
// normal quantity = 2
//
// Bundle:
// product 1 quantity = 1
//
// Final stock deduction:
// 2 + 1 = 3
// ============================================================
const buildStockRequirements = (
  items,
  appliedDeals = {},
) => {
  const requirements = new Map();

  // ----------------------------------------------------------
  // Product quantities
  // ----------------------------------------------------------
  for (const item of items) {
    const productId = String(
      item.productId,
    );

    const quantity =
      getItemStockQuantity(item);

    requirements.set(
      productId,
      (requirements.get(productId) || 0) +
        quantity,
    );
  }

  // ----------------------------------------------------------
  // Bundle quantities
  // ----------------------------------------------------------
  //
  // Bundle example:
  //
  // bundleQuantity = 2
  //
  // productQuantities:
  // [
  //   { productId: "1", quantity: 1 },
  //   { productId: "6", quantity: 1 },
  //   { productId: "9", quantity: 1 }
  // ]
  //
  // Therefore:
  //
  // product 1 → +2
  // product 6 → +2
  // product 9 → +2
  // ----------------------------------------------------------
  const bundles =
    appliedDeals?.bundles || [];

  for (const bundle of bundles) {
    if (!bundle) {
      continue;
    }

    const bundleQuantity =
      Number(
        bundle.bundleQuantity || 0,
      );

    if (bundleQuantity <= 0) {
      continue;
    }

    const productQuantities =
      bundle.productQuantities || [];

    for (const bundleProduct of productQuantities) {
      const productId = String(
        bundleProduct.productId,
      );

      const quantityPerBundle =
        Number(
          bundleProduct.quantity || 0,
        );

      if (quantityPerBundle <= 0) {
        continue;
      }

      const totalBundleQuantity =
        quantityPerBundle *
        bundleQuantity;

      requirements.set(
        productId,
        (requirements.get(productId) || 0) +
          totalBundleQuantity,
      );
    }
  }

  return requirements;
};

// ============================================================
// Check whether all products have enough stock
// ============================================================
//
// Supports:
// - Normal products
// - BOGO
// - Free-item deals
// - Quantity deals
// - Bundles
// ============================================================
export const validateOrderStock = async (
  items,
  appliedDeals = {},
) => {
  const requirements =
    buildStockRequirements(
      items,
      appliedDeals,
    );

  const productIds = [
    ...requirements.keys(),
  ];

  const products =
    await Promise.all(
      productIds.map((productId) =>
        getProductById(productId),
      ),
    );

  const insufficientItems = [];

  products.forEach((product) => {
    const productId = String(
      product.id,
    );

    const availableStock =
      Number(product.stock);

    const requestedQuantity =
      Number(
        requirements.get(productId) || 0,
      );

    if (
      availableStock <
      requestedQuantity
    ) {
      insufficientItems.push({
        productId: product.id,
        title: product.title,
        available: availableStock,
        requested: requestedQuantity,
      });
    }
  });

  return {
    valid:
      insufficientItems.length === 0,

    insufficientItems,
  };
};

// ============================================================
// Reduce stock for every product in the order
// ============================================================
//
// IMPORTANT:
//
// The function now accepts:
//
// reduceOrderStock(items, appliedDeals)
//
// This allows bundle inventory to be deducted correctly.
// ============================================================
export const reduceOrderStock = async (
  items,
  appliedDeals = {},
) => {
  if (!items || items.length === 0) {
    return [];
  }

  // ----------------------------------------------------------
  // Build final stock requirements
  // ----------------------------------------------------------
  const requirements =
    buildStockRequirements(
      items,
      appliedDeals,
    );

  const productIds = [
    ...requirements.keys(),
  ];

  // ----------------------------------------------------------
  // Get latest product data
  // ----------------------------------------------------------
  const products =
    await Promise.all(
      productIds.map((productId) =>
        getProductById(productId),
      ),
    );

  // ----------------------------------------------------------
  // Validate EVERYTHING before changing stock
  // ----------------------------------------------------------
  for (const product of products) {
    const productId = String(
      product.id,
    );

    const availableStock =
      Number(product.stock);

    const requestedQuantity =
      Number(
        requirements.get(productId) || 0,
      );

    if (
      availableStock <
      requestedQuantity
    ) {
      throw new Error(
        `"${product.title}" has only ${availableStock} item(s) left in stock, but ${requestedQuantity} item(s) are required.`,
      );
    }
  }

  const updatedProducts = [];

  try {
    // --------------------------------------------------------
    // Reduce stock
    // --------------------------------------------------------
    for (const product of products) {
      const productId = String(
        product.id,
      );

      const stockQuantity =
        Number(
          requirements.get(productId) || 0,
        );

      const previousStock =
        Number(product.stock);

      const newStock =
        previousStock -
        stockQuantity;

      const updatedProduct =
        await updateProductStock(
          product.id,
          newStock,
        );

      updatedProducts.push({
        productId: product.id,

        previousStock,

        updatedStock: newStock,

        quantityDeducted:
          stockQuantity,

        product:
          updatedProduct,
      });
    }

    return updatedProducts;
  } catch (error) {
    // --------------------------------------------------------
    // Roll back any products that were already updated
    // --------------------------------------------------------
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

// ============================================================
// Restore stock
// ============================================================
//
// Used when:
// - Order creation fails after stock reduction
// - Order cancellation happens
// ============================================================
export const restoreOrderStock = async (
  stockUpdates,
) => {
  if (
    !stockUpdates ||
    stockUpdates.length === 0
  ) {
    return;
  }

  for (const update of stockUpdates) {
    await updateProductStock(
      update.productId,
      update.previousStock,
    );
  }
};