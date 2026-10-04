import api from "../../services/api";

export const getDeals = async () => {
  const response = await api.get("/deals");
  return response.data;
};

export const getDealById = async (id) => {
  const response = await api.get(`/deals/${id}`);
  return response.data;
};

export const createDeal = async (dealData) => {
  const response = await api.post("/deals", dealData);
  return response.data;
};

export const updateDeal = async (id, dealData) => {
  const response = await api.patch(`/deals/${id}`, dealData);
  return response.data;
};

export const deleteDeal = async (id) => {
  await api.delete(`/deals/${id}`);
};

export const toggleDealStatus = async (id, isActive) => {
  const response = await api.patch(`/deals/${id}`, {
    isActive,
  });

  return response.data;
};