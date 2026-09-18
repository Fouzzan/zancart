import api from "./api";

export const getCouponByCode = async (code) => {
  const response = await api.get(
    `/coupons?code=${encodeURIComponent(code)}`
  );

  return response.data[0] || null;
};