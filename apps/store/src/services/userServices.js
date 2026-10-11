
const API_URL = import.meta.env.VITE_API_URL;

// -----------------------------------------
// Helper: Handle API responses
// -----------------------------------------

const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(`${errorMessage} (${response.status})`);
  }

  return response.json();
};

// -----------------------------------------
// Get all users
// -----------------------------------------

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);

  return handleResponse(response, "Failed to fetch users");
};

// -----------------------------------------
// Get user by ID
// Supports a JSON Server ID or Clerk user ID
// -----------------------------------------

export const getUserById = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // First, try the JSON Server record ID.
  const directResponse = await fetch(
    `${API_URL}/users/${encodeURIComponent(userId)}`
  );

  if (directResponse.ok) {
    return directResponse.json();
  }

  if (directResponse.status !== 404) {
    throw new Error(
      `Failed to fetch user (${directResponse.status})`
    );
  }

  // If it is not a JSON Server ID, search by Clerk ID.
  const query = new URLSearchParams({
    userId,
  });

  const response = await fetch(
    `${API_URL}/users?${query.toString()}`
  );

  const users = await handleResponse(
    response,
    "Failed to fetch user"
  );

  return users[0] ?? null;
};

// -----------------------------------------
// Update user
// id must be the JSON Server record ID
// -----------------------------------------

export const updateUser = async (id, userData) => {
  if (!id) {
    throw new Error("User record ID is required");
  }

  const response = await fetch(
    `${API_URL}/users/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return handleResponse(response, "Failed to update user");
};

// -----------------------------------------
// Block user
// -----------------------------------------

export const blockUser = async (id) => {
  return updateUser(id, {
    status: "blocked",
    isBlocked: true,
  });
};

// -----------------------------------------
// Unblock user
// -----------------------------------------

export const unblockUser = async (id) => {
  return updateUser(id, {
    status: "active",
    isBlocked: false,
  });
};

// -----------------------------------------
// Sync Clerk user with database
// -----------------------------------------

export const syncUser = async (user) => {
  if (!user?.id) {
    throw new Error("Invalid Clerk user");
  }

  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  const clerkUserId = user.id;

  const userData = {
    userId: clerkUserId,
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

  // Search using Clerk ID instead of assuming it is
  // the JSON Server record ID.
  const query = new URLSearchParams({
    userId: clerkUserId,
  });

  const lookupResponse = await fetch(
    `${API_URL}/users?${query.toString()}`
  );

  const existingUsers = await handleResponse(
    lookupResponse,
    "Failed to check existing user"
  );

  if (existingUsers.length > 0) {
    // Preserve the actual JSON Server ID and existing
    // account status/role fields.
    const existingUser = existingUsers[0];

    const response = await fetch(
      `${API_URL}/users/${encodeURIComponent(existingUser.id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    return handleResponse(response, "Failed to sync user");
  }

  // Create a record only if no matching Clerk user exists.
  const createResponse = await fetch(`${API_URL}/users`, {
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
  });

  return handleResponse(createResponse, "Failed to create user");
};