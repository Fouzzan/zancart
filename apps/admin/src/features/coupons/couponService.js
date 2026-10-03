
import api from "@/services/api";

/**
 * Get all coupons
 */
export const getCoupons = async () => {
  const response = await api.get("/coupons");

  return response.data;
};

/**
 * Get a single coupon
 */
export const getCouponById = async (couponId) => {
  const response = await api.get(`/coupons/${couponId}`);

  return response.data;
};

/**
 * Create a new coupon
 */
export const createCoupon = async (coupon) => {
  const response = await api.post("/coupons", coupon);

  return response.data;
};

/**
 * Update an existing coupon
 */
export const updateCoupon = async (
  couponId,
  coupon,
) => {
  const response = await api.patch(
    `/coupons/${couponId}`,
    coupon,
  );

  return response.data;
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (couponId) => {
  const response = await api.delete(
    `/coupons/${couponId}`,
  );

  return response.data;
};

/**
 * Check whether a coupon code already exists
 */
export const couponCodeExists = async (
  code,
  excludeId = null,
) => {
  const response = await api.get(
    `/coupons?code=${encodeURIComponent(code)}`,
  );

  const coupons = response.data;

  return coupons.some(
    (coupon) =>
      coupon.id !== excludeId &&
      coupon.code?.toLowerCase() ===
        code.toLowerCase(),
  );
};

