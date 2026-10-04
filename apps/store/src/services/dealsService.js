
import api from "./api";

/**
 * Get all deals
 */
export const getDeals = async () => {
  const response = await api.get("/deals");

  return response.data;
};

/**
 * Get currently active deals
 *
 * A deal is active only when:
 * - isActive is true
 * - current date is between startDate and endDate
 */
export const getActiveDeals = async () => {
  const response = await api.get("/deals");

  const now = new Date();

  return response.data
    .filter((deal) => {
      if (!deal.isActive) {
        return false;
      }

      const startDate = new Date(deal.startDate);
      const endDate = new Date(deal.endDate);

      return now >= startDate && now <= endDate;
    })
    .sort(
      (a, b) =>
        (a.priority ?? 999) -
        (b.priority ?? 999)
    );
};

/**
 * Get a single deal by ID
 */
export const getDealById = async (dealId) => {
  const response = await api.get(`/deals/${dealId}`);

  return response.data;
};


/**
 * Get active deals with their actual products
 */
export const getActiveDealsWithProducts = async () => {
  const [dealsResponse, productsResponse] = await Promise.all([
    api.get("/deals"),
    api.get("/products"),
  ]);

  const deals = dealsResponse.data;
  const products = productsResponse.data;

  const now = new Date();

  return deals
    .filter((deal) => {
      if (!deal.isActive) {
        return false;
      }

      const startDate = new Date(deal.startDate);
      const endDate = new Date(deal.endDate);

      return now >= startDate && now <= endDate;
    })
    .sort(
      (a, b) =>
        (a.priority ?? 999) -
        (b.priority ?? 999)
    )
    .map((deal) => {
      const dealProductIds = (deal.products || []).map(String);

      const dealProducts = products.filter((product) =>
        dealProductIds.includes(String(product.id))
      );

      return {
        ...deal,
        products: dealProducts,
      };
    });
};