
import api from "../../services/api";

export const getBanners = async () => {
  const response = await api.get("/banners");
  return response.data;
};

export const getBannerById = async (id) => {
  const response = await api.get(`/banners/${id}`);
  return response.data;
};

export const createBanner = async (bannerData) => {
  const response = await api.post("/banners", bannerData);
  return response.data;
};

export const updateBanner = async (id, bannerData) => {
  const response = await api.patch(`/banners/${id}`, bannerData);
  return response.data;
};

export const deleteBanner = async (id) => {
  await api.delete(`/banners/${id}`);
};