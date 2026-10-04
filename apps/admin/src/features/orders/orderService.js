const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// Get all orders
// ============================================================
export const getOrders = async () => {
  const response = await fetch(`${API_URL}/orders`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
};

// ============================================================
// Get single order
// ============================================================
export const getOrderById = async (orderId) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Order not found");
  }

  return response.json();
};

// ============================================================
// Get all users
// ============================================================
export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

// ============================================================
// Update order status
// ============================================================
export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
};