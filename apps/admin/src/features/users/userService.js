
import api from "@/services/api";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, data) => {
  const response = await api.patch(`/users/${userId}`, data);
  return response.data;
};

export const blockUser = async (id) => {
  return updateUser(id, {
    status: "blocked",
  });
};

export const unblockUser = async (id) => {
  return updateUser(id, {
    status: "active",
  });
};


const ADMIN_API_URL =
  import.meta.env.VITE_ADMIN_API_URL ||
  "http://localhost:4000";

export const updateAdminRole = async (
  clerkUserId,
  role,
) => {
  const response = await fetch(
    `${ADMIN_API_URL}/api/admin/users/${clerkUserId}/role`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        role,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update admin access.",
    );
  }

  return data;
};


