
import { getActiveDeals } from "./dealsService";

/**
 * -----------------------------------------
 * FIND PRODUCT DEAL
 * -----------------------------------------
 *
 * Finds the highest-priority deal applicable
 * to a specific product.
 */
export const getProductDeal = (productId, deals) => {
  return (
    deals
      .filter((deal) =>
        deal.products?.some(
          (id) => String(id) === String(productId),
        ),
      )
      .sort(
        (a, b) =>
          (a.priority ?? 999) -
          (b.priority ?? 999),
      )[0] || null
  );
};

/**
 * -----------------------------------------
 * FLASH SALE
 * -----------------------------------------
 */
export const calculateFlashSale = (item, deal) => {
  const quantity = Number(item.quantity) || 0;

  const unitPrice =
    Number(item.discountPrice) || 0;

  const discountPercentage =
    Number(deal.discountValue) || 0;

  const discountPerUnit =
    (unitPrice * discountPercentage) / 100;

  const finalUnitPrice = Math.max(
    0,
    unitPrice - discountPerUnit,
  );

  const discount =
    discountPerUnit * quantity;

  const finalPrice =
    finalUnitPrice * quantity;

  return {
    discount,
    finalPrice,
    finalUnitPrice,
    discountPercentage,
    freeQuantity: 0,
    paidQuantity: quantity,
  };
};

/**
 * -----------------------------------------
 * BUY 1 GET 1 FREE
 * -----------------------------------------
 *
 * Examples:
 *
 * Quantity 1 → Pay for 1
 * Quantity 2 → Pay for 1
 * Quantity 3 → Pay for 2
 * Quantity 4 → Pay for 2
 * Quantity 5 → Pay for 3
 *
 * The free item remains part of the same
 * cart item rather than creating a separate
 * cart entry.
 */
export const calculateBOGO = (item, deal) => {
  const quantity = Number(item.quantity) || 0;

  const unitPrice =
    Number(item.discountPrice) || 0;

  const freeQuantity =
    Math.floor(quantity / 2);

  const paidQuantity =
    quantity - freeQuantity;

  const discount =
    freeQuantity * unitPrice;

  const finalPrice =
    paidQuantity * unitPrice;

  return {
    discount,
    finalPrice,
    finalUnitPrice: unitPrice,
    freeQuantity,
    paidQuantity,
    discountPercentage: 0,
  };
};

/**
 * -----------------------------------------
 * QUANTITY DISCOUNT
 * -----------------------------------------
 *
 * Example:
 *
 * 2 → 10%
 * 3 → 15%
 * 4 → 20%
 *
 * Quantity 5 gets the highest
 * applicable tier.
 */
export const calculateQuantityDiscount = (
  item,
  deal,
) => {
  const quantity =
    Number(item.quantity) || 0;

  const unitPrice =
    Number(item.discountPrice) || 0;

  const tiers = Array.isArray(deal.tiers)
    ? deal.tiers
    : [];

  const eligibleTiers = tiers
    .filter(
      (tier) =>
        quantity >= Number(tier.quantity),
    )
    .sort(
      (a, b) =>
        Number(b.quantity) -
        Number(a.quantity),
    );

  // No tier applies.
  if (eligibleTiers.length === 0) {
    return {
      discount: 0,
      finalPrice: unitPrice * quantity,
      finalUnitPrice: unitPrice,
      discountPercentage: 0,
      freeQuantity: 0,
      paidQuantity: quantity,
    };
  }

  const selectedTier =
    eligibleTiers[0];

  const discountPercentage =
    Number(selectedTier.discount) || 0;

  const discountPerUnit =
    (unitPrice * discountPercentage) / 100;

  const finalUnitPrice = Math.max(
    0,
    unitPrice - discountPerUnit,
  );

  const discount =
    discountPerUnit * quantity;

  const finalPrice =
    finalUnitPrice * quantity;

  return {
    discount,
    finalPrice,
    finalUnitPrice,
    discountPercentage,
    freeQuantity: 0,
    paidQuantity: quantity,
    appliedTier: selectedTier,
  };
};

/**
 * -----------------------------------------
 * BUNDLE DEAL
 * -----------------------------------------
 *
 * Example:
 *
 * Products:
 * 1
 * 6
 * 9
 *
 * Bundle price = ₹2499
 *
 * If the cart contains:
 *
 * Product 1 → 3
 * Product 6 → 2
 * Product 9 → 2
 *
 * The number of complete bundles is:
 *
 * min(3, 2, 2) = 2
 *
 * Therefore:
 *
 * 2 × ₹2499 = ₹4998
 *
 * The remaining Product 1 quantity
 * stays outside the bundle.
 */
export const calculateBundle = (
  items,
  deal,
) => {
  // -----------------------------------------
  // Validate deal products
  // -----------------------------------------
  if (
    !Array.isArray(deal.products) ||
    deal.products.length === 0
  ) {
    return {
      applicable: false,
      discount: 0,
      finalPrice: 0,
      originalPrice: 0,
      bundlePrice: 0,
      bundleQuantity: 0,
      items: [],
      productQuantities: [],
    };
  }

  const dealProductIds =
    deal.products.map(String);

  // -----------------------------------------
  // Find the corresponding cart items
  // -----------------------------------------
  const bundleItems =
    dealProductIds.map((productId) =>
      items.find(
        (item) =>
          String(item.id) === productId,
      ),
    );

  // -----------------------------------------
  // Every required product must exist
  // -----------------------------------------
  const hasAllProducts =
    bundleItems.every(
      (item) =>
        item &&
        Number(item.quantity) > 0,
    );

  if (!hasAllProducts) {
    return {
      applicable: false,
      discount: 0,
      finalPrice: 0,
      originalPrice: 0,
      bundlePrice:
        Number(deal.bundlePrice) || 0,
      bundleQuantity: 0,
      items: [],
      productQuantities: [],
    };
  }

  // -----------------------------------------
  // Determine how many complete bundles
  // can be created.
  //
  // Example:
  //
  // Product 1 → 3
  // Product 6 → 2
  // Product 9 → 2
  //
  // min(3,2,2) = 2 bundles
  // -----------------------------------------
  const bundleQuantity = Math.min(
    ...bundleItems.map(
      (item) =>
        Number(item.quantity) || 0,
    ),
  );

  if (bundleQuantity <= 0) {
    return {
      applicable: false,
      discount: 0,
      finalPrice: 0,
      originalPrice: 0,
      bundlePrice:
        Number(deal.bundlePrice) || 0,
      bundleQuantity: 0,
      items: [],
      productQuantities: [],
    };
  }

  // -----------------------------------------
  // Price of one complete bundle
  // -----------------------------------------
  const originalBundlePrice =
    bundleItems.reduce(
      (total, item) =>
        total +
        Number(item.discountPrice || 0),
      0,
    );

  const bundlePrice =
    Number(deal.bundlePrice) || 0;

  // -----------------------------------------
  // The bundle should actually be cheaper
  // -----------------------------------------
  if (
    bundlePrice >=
    originalBundlePrice
  ) {
    return {
      applicable: false,
      discount: 0,
      finalPrice:
        originalBundlePrice *
        bundleQuantity,
      originalPrice:
        originalBundlePrice *
        bundleQuantity,
      bundlePrice,
      bundleQuantity,
      items: bundleItems,
      productQuantities:
        dealProductIds.map(
          (productId) => ({
            productId,
            quantity: bundleQuantity,
          }),
        ),
    };
  }

  // -----------------------------------------
  // Calculate total original price
  // -----------------------------------------
  const originalPrice =
    originalBundlePrice *
    bundleQuantity;

  // -----------------------------------------
  // Calculate total bundle price
  // -----------------------------------------
  const finalPrice =
    bundlePrice *
    bundleQuantity;

  // -----------------------------------------
  // Calculate total discount
  // -----------------------------------------
  const discount = Math.max(
    0,
    originalPrice - finalPrice,
  );

  // -----------------------------------------
  // Explicit stock quantities
  //
  // One bundle consumes one unit
  // of every required product.
  //
  // Two bundles consume two units
  // of every required product.
  // -----------------------------------------
  const productQuantities =
    dealProductIds.map(
      (productId) => ({
        productId,
        quantity: bundleQuantity,
      }),
    );

  return {
    applicable: true,

    discount,

    finalPrice,

    originalPrice,

    bundlePrice,

    bundleQuantity,

    items: bundleItems,

    productQuantities,
  };
};

/**
 * -----------------------------------------
 * CALCULATE ALL CART DEALS
 * -----------------------------------------
 *
 * Main function used by Cart.jsx,
 * Checkout.jsx and Payment.jsx.
 */
export const calculateCartDeals = async (
  items,
) => {
  // -----------------------------------------
  // Empty cart
  // -----------------------------------------
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return {
      items: [],
      bundles: [],
      subtotal: 0,
      totalDiscount: 0,
      bundleDiscount: 0,
      finalTotal: 0,
    };
  }

  // -----------------------------------------
  // Fetch currently active deals
  // -----------------------------------------
  const deals =
    await getActiveDeals();

  let totalDiscount = 0;

  // -----------------------------------------
  // PRODUCT-LEVEL DEALS
  // -----------------------------------------
  const calculatedItems =
    items.map((item) => {
      const deal =
        getProductDeal(
          item.id,
          deals,
        );

      const originalUnitPrice =
        Number(item.discountPrice) || 0;

      const quantity =
        Number(item.quantity) || 0;

      const originalTotal =
        originalUnitPrice *
        quantity;

      // ---------------------------------------
      // No deal
      // ---------------------------------------
      if (!deal) {
        return {
          ...item,

          deal: null,

          originalItemTotal:
            originalTotal,

          dealDiscount: 0,

          finalItemTotal:
            originalTotal,

          freeQuantity: 0,

          paidQuantity:
            quantity,

          discountPercentage: 0,
        };
      }

      let result;

      // ---------------------------------------
      // Calculate product-level deal
      // ---------------------------------------
      switch (deal.type) {
        case "flash_sale":
          result =
            calculateFlashSale(
              item,
              deal,
            );
          break;

        case "bogo":
          result =
            calculateBOGO(
              item,
              deal,
            );
          break;

        case "quantity_discount":
          result =
            calculateQuantityDiscount(
              item,
              deal,
            );
          break;

        default:
          result = {
            discount: 0,

            finalPrice:
              originalTotal,

            finalUnitPrice:
              originalUnitPrice,

            freeQuantity: 0,

            paidQuantity:
              quantity,

            discountPercentage: 0,
          };
      }

      totalDiscount +=
        Number(result.discount) || 0;

      return {
        ...item,

        deal,

        originalItemTotal:
          originalTotal,

        dealDiscount:
          Number(result.discount) || 0,

        finalItemTotal:
          Number(result.finalPrice) || 0,

        finalUnitPrice:
          Number(
            result.finalUnitPrice,
          ) || 0,

        freeQuantity:
          Number(
            result.freeQuantity,
          ) || 0,

        paidQuantity:
          Number(
            result.paidQuantity,
          ) || quantity,

        discountPercentage:
          Number(
            result.discountPercentage,
          ) || 0,

        appliedTier:
          result.appliedTier ||
          null,
      };
    });

  // -----------------------------------------
  // BUNDLE DEALS
  // -----------------------------------------
  const bundleDeals =
    deals.filter(
      (deal) =>
        deal.type === "bundle",
    );

  const bundles =
    bundleDeals.map((deal) => {
      const result =
        calculateBundle(
          calculatedItems,
          deal,
        );

      return {
        deal,

        ...result,
      };
    });

  // -----------------------------------------
  // Calculate total bundle discount
  // -----------------------------------------
  const bundleDiscount =
    bundles.reduce(
      (total, bundle) =>
        total +
        (bundle.applicable
          ? Number(
              bundle.discount,
            ) || 0
          : 0),
      0,
    );

  // -----------------------------------------
  // Add bundle discount to total discount
  // -----------------------------------------
  totalDiscount +=
    bundleDiscount;

  // -----------------------------------------
  // CART SUBTOTAL
  //
  // This is the amount after:
  //
  // - Flash Sale
  // - BOGO
  // - Quantity Discount
  // -----------------------------------------
  const subtotal =
    calculatedItems.reduce(
      (total, item) =>
        total +
        Number(
          item.finalItemTotal,
        ),
      0,
    );

  // -----------------------------------------
  // FINAL TOTAL
  //
  // Bundle discounts are applied after
  // product-level discounts.
  // -----------------------------------------
  const finalTotal =
    Math.max(
      0,
      subtotal -
        bundleDiscount,
    );

  // -----------------------------------------
  // Return everything
  // -----------------------------------------
  return {
    items:
      calculatedItems,

    bundles,

    subtotal,

    totalDiscount,

    bundleDiscount,

    finalTotal,
  };
};
