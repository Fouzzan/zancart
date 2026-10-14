
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------
// Users database
// server/services/authService.js
//              ↓
// server/data/users.json
// ------------------------------------------------------------

const USERS_PATH = path.join(
  __dirname,
  "../data/users.json"
);

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toPublicUser(user) {
  const isBlocked =
    user.isBlocked === true || user.status === "blocked";

  return {
    id: user.id,
    userId: user.userId,
    clerkId: user.clerkId,
    name:
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role === "admin" ? "admin" : "user",
    status: isBlocked ? "blocked" : "active",
    isBlocked,
    createdAt: user.createdAt,
    source: "auth",
  };
}

function getValidationErrorStatus(message) {
  if (message === "An account with this email already exists.") {
    return 409;
  }

  if (
    [
      "Name, email and password are required.",
      "Email address is invalid.",
      "Password must be at least 6 characters.",
      "User ID is required.",
      "Invalid status.",
      "User not found.",
    ].includes(message)
  ) {
    return 400;
  }

  return 500;
}

export function getAuthServiceErrorStatus(error) {
  return getValidationErrorStatus(error?.message);
}

// ------------------------------------------------------------
// Database helpers
// ------------------------------------------------------------

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_PATH, "utf-8");

    const users = JSON.parse(data);

    // users.json must contain an array
    if (!Array.isArray(users)) {
      throw new Error("users.json must contain a JSON array.");
    }

    return users;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(
    USERS_PATH,
    JSON.stringify(users, null, 2),
    "utf-8"
  );
}

// ------------------------------------------------------------
// Register User
// ------------------------------------------------------------

export async function registerUser({
  name,
  email,
  password,
}) {
  if (!name || !email || !password) {
    throw new Error(
      "Name, email and password are required."
    );
  }

  if (password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters."
    );
  }

  const users = await readUsers();

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new Error("Email address is invalid.");
  }

  // Check whether email already exists
  const existingUser = users.find(
    (user) =>
      user.email?.toLowerCase() === normalizedEmail
  );

  if (existingUser) {
    throw new Error(
      "An account with this email already exists."
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
    isBlocked: false,
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  await writeUsers(users);

  // Never return password
  return toPublicUser(user);
}


// Create a regular customer from an authenticated admin request.
export async function createCustomerByAdmin({
  name,
  email,
  password,
}) {
  return registerUser({
    name,
    email,
    password,
  });
}

// ------------------------------------------------------------
// Login User / Admin
// ------------------------------------------------------------

export async function loginUser({
  email,
  password,
}) {
  if (!email || !password) {
    throw new Error(
      "Email and password are required."
    );
  }

  const users = await readUsers();

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user = users.find(
    (user) =>
      user.email?.toLowerCase() === normalizedEmail
  );

  if (!user) {
    throw new Error(
      "Invalid email or password."
    );
  }

  // Check blocked status
  if (user.isBlocked === true || user.status === "blocked") {
    throw new Error(
      "Your account has been blocked."
    );
  }

  // Check password
  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error(
      "Invalid email or password."
    );
  }

  // Create JWT
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,

    user: {
      ...toPublicUser(user),
    },
  };
}

//get all auth users

export async function getAllAuthUsers() {
  const users = await readUsers();

  return users.map(toPublicUser);
}

// ------------------------------------------------------------
// Get User By ID
// ------------------------------------------------------------

export async function getUserById(userId) {
  const users = await readUsers();

  const user = users.find(
    (user) => user.id === userId
  );

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}

// ------------------------------------------------------------
// Verify JWT
// ------------------------------------------------------------

export function verifyToken(token) {
  return jwt.verify(
    token,
    JWT_SECRET
  );
}


export async function updateUserRole(
  userId,
  newRole,
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!["user", "admin"].includes(newRole)) {
    throw new Error("Invalid role.");
  }

  const users = await readUsers();

  const userIndex = users.findIndex(
    (user) => user.id === userId,
  );

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  users[userIndex].role = newRole;

  await writeUsers(users);

  return toPublicUser(users[userIndex]);
}

export async function getUserByEmail(email) {
  const users = await readUsers();

  const normalizedEmail = email
    ?.trim()
    .toLowerCase();

  const user = users.find(
    (user) =>
      user.email?.toLowerCase() ===
      normalizedEmail,
  );

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}

export async function updateUserBlockedStatus(userId, isBlocked) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const users = await readUsers();

  const userIndex = users.findIndex(
    (user) => user.id === userId,
  );

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  users[userIndex].isBlocked = Boolean(isBlocked);
  users[userIndex].status = isBlocked ? "blocked" : "active";

  await writeUsers(users);

  return toPublicUser(users[userIndex]);
}

export async function resetUserPassword(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const users = await readUsers();

  const userIndex = users.findIndex(
    (user) => user.id === userId,
  );

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  // Generate a temporary password.
  const temporaryPassword =
    `ZanCart@${crypto.randomBytes(4).toString("hex")}`;

  // Hash the temporary password.
  const hashedPassword = await bcrypt.hash(
    temporaryPassword,
    12,
  );

  users[userIndex].password = hashedPassword;

  // Force the user to change it after logging in.
  users[userIndex].mustChangePassword = true;

  await writeUsers(users);

  return {
    user: toPublicUser(users[userIndex]),
    temporaryPassword,
  };
}

export async function changeUserPassword(
  email,
  newPassword
) {
  if (!email) {
    throw new Error(
      "User email is required."
    );
  }

  if (!newPassword) {
    throw new Error(
      "New password is required."
    );
  }

  if (newPassword.length < 6) {
    throw new Error(
      "Password must be at least 6 characters."
    );
  }

  const users = await readUsers();

  const normalizedEmail =
    email.trim().toLowerCase();

  const userIndex = users.findIndex(
    (user) =>
      user.email?.toLowerCase() ===
      normalizedEmail
  );

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      12
    );

  users[userIndex].password =
    hashedPassword;

  users[userIndex].mustChangePassword =
    false;

  await writeUsers(users);

  return toPublicUser(users[userIndex]);
}
