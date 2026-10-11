import api from "@/services/authApi";


export const loginAdmin = async (email, password) => {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
};