
import axios from "axios";
import bcrypt from "bcryptjs";

const AUTH_DB_URL =
  import.meta.env.VITE_AUTH_DB_URL || "http://127.0.0.1:3002";

export const loginAdmin = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const response = await axios.get(`${AUTH_DB_URL}/users`, {
    params: { email: normalizedEmail },
  });

  const user = response.data.find(
    (record) => record.email?.toLowerCase() === normalizedEmail,
  );

  if (!user || !(await bcrypt.compare(password, user.password || ""))) {
    throw new Error("Invalid email or password.");
  }

  if (!["admin", "superadmin"].includes(user.role)) {
    throw new Error("Admin access required.");
  }

  if (user.isBlocked || user.status === "blocked") {
    throw new Error("This account is blocked.");
  }

  const { password: _password, ...admin } = user;

  return {
    user: {
      ...admin,
      role: user.role,
    },
    token: `demo-${user.id}`,
  };
};
