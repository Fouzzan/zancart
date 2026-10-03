
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",

  initialState,

  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },

    updateUser: (state, action) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id,
      );

      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUsers,
  updateUser,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;

