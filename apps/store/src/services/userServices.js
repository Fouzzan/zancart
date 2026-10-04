
const API_URL = import.meta.env.VITE_API_URL;

// -----------------------------------------
// Get all users
// -----------------------------------------

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

// -----------------------------------------
// Get user by ID
// -----------------------------------------

export const getUserById = async (id) => {
  const response = await fetch(
    `${API_URL}/users/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

// -----------------------------------------
// Update user
// -----------------------------------------

export const updateUser = async (id, userData) => {
  const response = await fetch(
    `${API_URL}/users/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
};

// -----------------------------------------
// Block user
// -----------------------------------------

export const blockUser = async (id) => {
  return updateUser(id, {
    status: "blocked",
  });
};

// -----------------------------------------
// Unblock user
// -----------------------------------------

export const unblockUser = async (id) => {
  return updateUser(id, {
    status: "active",
  });
};

// -----------------------------------------
// Sync Clerk user with database
// -----------------------------------------

export const syncUser = async (user) => {
  if (!user?.id) {
    throw new Error("Invalid Clerk user");
  }

  const userData = {
    id: user.id,
    userId: user.id,
    email:
      user.primaryEmailAddress?.emailAddress || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    name:
      [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || "User",
    imageUrl: user.imageUrl || "",
  };

  // Check whether the user already exists
  const existingResponse = await fetch(
    `${API_URL}/users/${user.id}`
  );

  // User doesn't exist → create
  if (existingResponse.status === 404) {
    const response = await fetch(
      `${API_URL}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          status: "active",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return response.json();
  }

  // User exists → update basic Clerk information
  if (existingResponse.ok) {
    const response = await fetch(
      `${API_URL}/users/${user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to sync user");
    }

    return response.json();
  }

  throw new Error("Failed to check existing user");
};
