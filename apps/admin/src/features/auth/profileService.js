
import axios from "axios";
import bcrypt from "bcryptjs";

const AUTH_DB_URL =
  import.meta.env.VITE_AUTH_DB_URL || "http://127.0.0.1:3002";

const authDb = axios.create({
  baseURL: AUTH_DB_URL,
  headers: { "Content-Type": "application/json" },
});

const getCurrentAdmin = () => {
  const storedUser = localStorage.getItem("adminUser");

  if (!storedUser) {
    throw new Error("Admin session not found. Please sign in again.");
  }

  const admin = JSON.parse(storedUser);

  if (!admin.id) {
    throw new Error("Admin ID is missing. Please sign in again.");
  }

  return admin;
};

const removePassword = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const getAdminProfile = async () => {
  const admin = getCurrentAdmin();
  const response = await authDb.get(`/users/${admin.id}`);
  const user = response.data;

  if (user.role !== "admin") {
    throw new Error("Admin account not found.");
  }

  return removePassword(user);
};

export const updateAdminProfile = async (profile) => {
  const admin = getCurrentAdmin();
  const name = profile.name.trim();
  const email = profile.email.trim().toLowerCase();

  if (name.length < 2) {
    throw new Error("Name must contain at least 2 characters.");
  }

  const usersResponse = await authDb.get("/users");

  const emailExists = usersResponse.data.some(
    (user) =>
      user.id !== admin.id &&
      user.email?.toLowerCase() === email,
  );

  if (emailExists) {
    throw new Error("This email address is already in use.");
  }

  const response = await authDb.patch(`/users/${admin.id}`, {
    name,
    email,
  });

  return removePassword(response.data);
};

export const changeAdminPassword = async (passwords) => {
  const admin = getCurrentAdmin();
  const response = await authDb.get(`/users/${admin.id}`);
  const user = response.data;

  if (user.role !== "admin") {
    throw new Error("Admin account not found.");
  }

  const currentPasswordMatches = await bcrypt.compare(
    passwords.currentPassword,
    user.password || "",
  );

  if (!currentPasswordMatches) {
    throw new Error("Current password is incorrect.");
  }

  if (passwords.newPassword.length < 6) {
    throw new Error("New password must contain at least 6 characters.");
  }

  const hashedPassword = await bcrypt.hash(passwords.newPassword, 12);

  await authDb.patch(`/users/${admin.id}`, {
    password: hashedPassword,
    mustChangePassword: false,
  });

  return {
    data: { message: "Password changed successfully." },
  };
};
