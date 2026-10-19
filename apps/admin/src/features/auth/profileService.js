
import axios from "axios";
import bcrypt from "bcryptjs";
import { uploadProductImage } from "../products/imageUploadService";

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

  let admin;

  try {
    admin = JSON.parse(storedUser);
  } catch {
    throw new Error("Invalid admin session. Please sign in again.");
  }

  if (admin?.id == null) {
    throw new Error("Admin ID is missing. Please sign in again.");
  }

  return admin;
};

const removePassword = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const getAdminRecord = async () => {
  const admin = getCurrentAdmin();

  try {
    const response = await authDb.get(
      `/users/${encodeURIComponent(String(admin.id))}`
    );

    const user = response.data;
    const role = String(user.role || "").toLowerCase();

    if (!["admin", "superadmin"].includes(role)) {
      throw new Error("This account does not have admin privileges.");
    }

    return user;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(
        `Admin record not found for ID "${admin.id}". Check the database ID.`
      );
    }

    throw error;
  }
};

export const getAdminProfile = async () => {
  const user = await getAdminRecord();
  return removePassword(user);
};

export const updateAdminProfile = async (profile) => {
  const user = await getAdminRecord();

  const name = String(profile.name || "").trim();
  const email = String(profile.email || "").trim().toLowerCase();

  if (name.length < 2) {
    throw new Error("Name must contain at least 2 characters.");
  }

  if (!email) {
    throw new Error("Email address is required.");
  }

  const usersResponse = await authDb.get("/users");

  const emailExists = usersResponse.data.some(
    (existingUser) =>
      String(existingUser.id) !== String(user.id) &&
      existingUser.email?.toLowerCase() === email
  );

  if (emailExists) {
    throw new Error("This email address is already in use.");
  }

  const response = await authDb.patch(
    `/users/${encodeURIComponent(String(user.id))}`,
    { name, email }
  );

  return removePassword(response.data);
};

export const updateAdminProfileImage = async (file) => {
  const user = await getAdminRecord();

  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  // Upload the image to Cloudinary.
  const imageUrl = await uploadProductImage(
    file,
    "zancart/admin-profiles"
  );

  // Save the Cloudinary URL in JSON Server.
  const response = await authDb.patch(
    `/users/${encodeURIComponent(String(user.id))}`,
    { imageUrl }
  );

  return removePassword(response.data);
};

export const removeAdminProfileImage = async () => {
  const user = await getAdminRecord();

  const response = await authDb.patch(
    `/users/${encodeURIComponent(String(user.id))}`,
    { imageUrl: null}
  );

  return removePassword(response.data);
}

export const changeAdminPassword = async (passwords) => {
  const user = await getAdminRecord();

  if (!user.password) {
    throw new Error("No password is configured for this account.");
  }

  if (passwords.newPassword.length < 6) {
    throw new Error("New password must contain at least 6 characters.");
  }

  const currentPasswordMatches = await bcrypt.compare(
    passwords.currentPassword,
    user.password
  );

  if (!currentPasswordMatches) {
    throw new Error("Current password is incorrect.");
  }

  const hashedPassword = await bcrypt.hash(passwords.newPassword, 12);

  await authDb.patch(
    `/users/${encodeURIComponent(String(user.id))}`,
    {
      password: hashedPassword,
      mustChangePassword: false,
    }
  );

  return {
    data: { message: "Password changed successfully." },
  };
};
