import api from "@/services/api";
import authApi from "@/services/authApi";

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
| Fetches users from JSON Server.
|--------------------------------------------------------------------------
*/

export const getUsers = async () => {
  const response = await api.get("/users");

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Get User By ID
|--------------------------------------------------------------------------
*/

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);

  return response.data;
};

export const getAuthUserById = async (id) => {
  const response = await authApi.get(`/api/admin/users/${id}`);

  return response.data.user;
};


/*
|--------------------------------------------------------------------------
| Update User Status
|--------------------------------------------------------------------------
| Used for Block / Unblock.
|--------------------------------------------------------------------------
*/

export const updateUserStatus = async (
  userId,
  isBlocked
) => {
  const response = await api.patch(
    `/users/${userId}`,
    {
      isBlocked,
      status: isBlocked
        ? "blocked"
        : "active",
    }
  );

  return response.data;
};

export const updateAuthUserStatus = async (
  userId,
  isBlocked
) => {
  const response = await authApi.patch(
    `/api/admin/users/${userId}/status`,
    {
      isBlocked,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Update Admin Role
|--------------------------------------------------------------------------
| Uses the custom authentication backend.
|--------------------------------------------------------------------------
*/

export const updateAdminRole = async (
  email,
  role
) => {
  const response = await authApi.patch(
    "/api/admin/users/role",
    {
      email,
      role,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| Change User Password
|--------------------------------------------------------------------------
| Admin manually sets a new password for a user.
|--------------------------------------------------------------------------
*/

export const changeUserPassword = async (
  email,
  newPassword
) => {
  const response = await authApi.patch(
    "/api/admin/users/change-password",
    {
      email,
      newPassword,
    }
  );

  return response.data;
};

export const createUser = async (userData) => {
  try {
    const response = await authApi.post(
      "/api/admin/users",
      userData,
    );

    if (!response.data?.success || !response.data?.user) {
      throw new Error(
        response.data?.message || "Unable to create customer.",
      );
    }

    return response.data.user;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 404 && message === "Route not found.") {
      throw new Error(
        "The auth API does not expose POST /api/admin/users yet. Redeploy the backend service with the latest admin routes.",
        { cause: error },
      );
    }

    if (status === 401) {
      throw new Error("Your admin session has expired. Please sign in again.", {
        cause: error,
      });
    }

    if (status === 403) {
      throw new Error(
        "Your account does not have permission to create customers.",
        { cause: error },
      );
    }

    throw new Error(message || "Unable to create customer.", { cause: error });
  }
};

export const getAuthUsers = async () => {
  const response = await authApi.get("/api/admin/users");
  return response.data.users;
};
