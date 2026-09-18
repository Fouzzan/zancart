import api from "./api";

export const getUserAddresses = async (userId) => {
  const response = await api.get(`/addresses?userId=${userId}`);
  return response.data;
};

export const createAddress = async (address) => {
  const response = await api.post("/addresses", address);
  return response.data;
};

export const updateAddress = async (addressId, address) => {
  const response = await api.patch(`/addresses/${addressId}`, address);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  await api.delete(`/addresses/${addressId}`);
};