
import api from "@/services/api";
import axios from "axios";
import bcrypt from "bcryptjs";

const AUTH_DB_URL =
  import.meta.env.VITE_AUTH_DB_URL || "http://127.0.0.1:3002";

const authDb = axios.create({
  baseURL: AUTH_DB_URL,
  headers: { "Content-Type": "application/json" },
});

const publicUser = (user) => {
  const { password, ...safeUser } = user;
  return { ...safeUser, source: "auth" };
};

// Existing storefront users from the store database.
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUserStatus = async (userId, isBlocked) => {
  const response = await api.patch(`/users/${userId}`, {
    isBlocked,
    status: isBlocked ? "blocked" : "active",
  });

  return response.data;
};

// Authentication users from the separate JSON Server database.
export const getAuthUsers = async () => {
  const response = await authDb.get("/users");
  return response.data.map(publicUser);
};

export const getAuthUserById = async (id) => {
  const response = await authDb.get(`/users/${id}`);
  return publicUser(response.data);
};

export const updateAuthUserStatus = async (userId, isBlocked) => {
  const response = await authDb.patch(`/users/${userId}`, {
    isBlocked,
    status: isBlocked ? "blocked" : "active",
  });

  return publicUser(response.data);
};

export const updateAdminRole = async (email, role) => {
  if (!["admin", "user"].includes(role)) {
    throw new Error("Invalid role.");
  }

  const response = await authDb.get("/users", {
    params: { email: email.trim().toLowerCase() },
  });

  const user = response.data.find(
    (record) => record.email?.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user) {
    throw new Error("User not found.");
  }

  await authDb.patch(`/users/${user.id}`, { role });

  return {
    success: true,
    user: publicUser({ ...user, role }),
  };
};

export const changeUserPassword = async (email, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const response = await authDb.get("/users", {
    params: { email: email.trim().toLowerCase() },
  });

  const user = response.data.find(
    (record) => record.email?.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user) {
    throw new Error("User not found.");
  }

  const password = await bcrypt.hash(newPassword, 12);

  await authDb.patch(`/users/${user.id}`, {
    password,
    mustChangePassword: true,
  });

  return { success: true, message: "Password changed successfully." };
};

export const createUser = async (userData) => {
  const name = userData.name?.trim();
  const email = userData.email?.trim().toLowerCase();
  const passwordValue = userData.password;

  if (!name || !email || !passwordValue) {
    throw new Error("Name, email, and password are required.");
  }

  if (passwordValue.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const response = await authDb.get("/users");
  const exists = response.data.some(
    (user) => user.email?.toLowerCase() === email,
  );

  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const password = await bcrypt.hash(passwordValue, 12);

  const created = await authDb.post("/users", {
    name,
    email,
    password,
    role: "user",
    isBlocked: false,
    status: "active",
    createdAt: new Date().toISOString(),
    mustChangePassword: true,
  });

  return publicUser(created.data);
};
