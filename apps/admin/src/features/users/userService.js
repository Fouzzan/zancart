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