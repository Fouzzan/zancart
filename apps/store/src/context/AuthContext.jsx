import axios from "axios";
import bcrypt from "bcryptjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const AUTH_DB_URL = import.meta.env.VITE_AUTH_DB_URL || "http://127.0.0.1:3002";

const authDb = axios.create({
  baseURL: AUTH_DB_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getPublicUser = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};

const findUserByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const response = await authDb.get("/users", {
    params: { email: normalizedEmail },
  });

  return response.data.find(
    (record) => record.email?.trim().toLowerCase() === normalizedEmail,
  );
};

const getUserError = (user) => {
  if (!user) return "Account not found.";

  if (user.isBlocked || user.status === "blocked") {
    return "This account is blocked.";
  }

  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("zancart_token");
    localStorage.removeItem("zancart_user_id");
    setUser(null);
  }, []);

  // Update the current user in React context without exposing the password.
  const updateUser = useCallback((updatedUser) => {
    setUser(getPublicUser(updatedUser));
  }, []);

  // Restore the session when the app loads or the page refreshes.
  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const token = localStorage.getItem("zancart_token");
      const userId = localStorage.getItem("zancart_user_id");

      if (!token || !userId) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const response = await authDb.get(
          `/users/${encodeURIComponent(userId)}`,
        );

        const account = response.data;
        const accountError = getUserError(account);

        if (accountError) {
          localStorage.removeItem("zancart_token");
          localStorage.removeItem("zancart_user_id");

          if (!cancelled) setUser(null);
          return;
        }

        if (!cancelled) {
          setUser(getPublicUser(account));
        }
      } catch {
        localStorage.removeItem("zancart_token");
        localStorage.removeItem("zancart_user_id");

        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Log in using an existing account.
  const login = useCallback(async ({ email, password }) => {
    if (!email?.trim() || !password) {
      throw new Error("Email and password are required.");
    }

    const account = await findUserByEmail(email);

    if (!account || !(await bcrypt.compare(password, account.password || ""))) {
      throw new Error("Invalid email or password.");
    }

    const accountError = getUserError(account);

    if (accountError) {
      throw new Error(accountError);
    }

    const authenticatedUser = getPublicUser(account);

    // Local coursework session marker, not a secure authentication token.
    localStorage.setItem("zancart_token", `demo-${account.id}`);
    localStorage.setItem("zancart_user_id", String(account.id));

    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  // Register a new customer account.
  const register = useCallback(async ({ name, email, password }) => {
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      throw new Error("Name, email, and password are required.");
    }

    if (normalizedName.length < 2) {
      throw new Error("Name must contain at least 2 characters.");
    }

    if (password.length < 6) {
      throw new Error("Password must contain at least 6 characters.");
    }

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const response = await authDb.post("/users", {
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      status: "active",
      isBlocked: false,
      createdAt: new Date().toISOString(),
      mustChangePassword: false,
    });

    return getPublicUser(response.data);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider.");
  }

  return context;
}
