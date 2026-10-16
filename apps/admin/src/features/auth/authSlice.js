import { createSlice } from "@reduxjs/toolkit";

const storedToken = localStorage.getItem("adminToken");
const storedUser = localStorage.getItem("adminUser");

const initialState = {
  admin: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),

  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // Called when login request starts
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Called after successful login
    loginSuccess: (state, action) => {
      const { admin, token } = action.payload;

      state.loading = false;
      state.error = null;

      state.admin = admin;
      state.token = token;
      state.isAuthenticated = true;

      // Persist authentication
      localStorage.setItem("adminToken", token);
      localStorage.setItem(
        "adminUser",
        JSON.stringify(admin)
      );
    },

    // Called when login fails
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;

      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    },

    // Logout admin
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    },

    // Clear login error
    clearAuthError: (state) => {
      state.error = null;
    },
    updateAdmin: (state, action) => {
      state.admin = action.payload;
      localStorage.setItem("adminUser", JSON.stringify(action.payload));
    },

    // Restore admin from localStorage
    restoreAuth: (state) => {
      const token = localStorage.getItem("adminToken");
      const user = localStorage.getItem("adminUser");

      if (token && user) {
        state.token = token;
        state.admin = JSON.parse(user);
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.admin = null;
        state.isAuthenticated = false;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearAuthError,
  updateAdmin,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;
