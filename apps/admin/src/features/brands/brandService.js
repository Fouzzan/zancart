const API_URL = import.meta.env.VITE_API_URL;

export const getBrands = async () => {
  const response = await fetch(`${API_URL}/brands`);

  if (!response.ok) {
    throw new Error("Failed to fetch brands");
  }

  return response.json();
};

export const createBrand = async (brand) => {
  const response = await fetch(`${API_URL}/brands`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(brand),
  });

  if (!response.ok) {
    throw new Error("Failed to create brand");
  }

  return response.json();
};

export const updateBrand = async (id, brand) => {
  const response = await fetch(`${API_URL}/brands/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(brand),
  });

  if (!response.ok) {
    throw new Error("Failed to update brand");
  }

  return response.json();
};

export const deleteBrand = async (id) => {
  const response = await fetch(`${API_URL}/brands/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete brand");
  }

  return true;
};