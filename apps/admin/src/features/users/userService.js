
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

export const updateAdminRole = async (email, role, actorId, actorRole) => {
  if (actorRole !== "superadmin") {
    throw new Error("Only a Super Admin can change administrator access.");
  }

  if (!["user", "admin"].includes(role)) {
    throw new Error("Only customer or admin roles can be assigned here.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const response = await authDb.get("/users");
  const records = response.data;

  const user = records.find(
    (record) => record.email?.trim().toLowerCase() === normalizedEmail,
  );

  if (!user) {
    throw new Error("User not found in the authentication database.");
  }

  if (String(user.id) === String(actorId)) {
    throw new Error("You cannot change your own elevated role.");
  }

  if (user.role === "superadmin") {
    throw new Error("A Super Admin role cannot be changed from this screen.");
  }

  if (user.role === "admin" && role === "user") {
    const superAdmins = records.filter(
      (record) => record.role === "superadmin",
    );

    if (superAdmins.length === 0) {
      throw new Error("At least one Super Admin must remain.");
    }
  }

  const updated = await authDb.patch(`/users/${user.id}`, { role });

  return { success: true, user: publicUser(updated.data) };
};

export const createAdmin = async ({ name, email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!name?.trim() || !normalizedEmail || !password) {
    throw new Error("Name, email, and password are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const response = await authDb.get("/users");

  if (
    response.data.some(
      (record) => record.email?.trim().toLowerCase() === normalizedEmail,
    )
  ) {
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const created = await authDb.post("/users", {
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "admin",
    isBlocked: false,
    status: "active",
    createdAt: new Date().toISOString(),
    mustChangePassword: true,
  });

  return publicUser(created.data);
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
    role: userData.role === "admin" ? "admin" : "user",
    isBlocked: false,
    status: "active",
    createdAt: new Date().toISOString(),
    mustChangePassword: true,
  });

  return publicUser(created.data);
};
