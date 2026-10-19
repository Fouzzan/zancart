import api from "../../services/api";

// ============================================================
// Fetch Data
// ============================================================

export const getAllOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// ============================================================
// Helpers
// ============================================================

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getOrderTotal = (order) => toNumber(order.totalAmount);

const getItemQuantity = (item) => {
  const paidQuantity = toNumber(
    item.paidQuantity ?? item.quantity ?? 0
  );
  const freeQuantity = toNumber(item.freeQuantity ?? 0);

  return paidQuantity + freeQuantity;
};

const normalizeId = (value) => {
  if (value === null || value === undefined) return "";

  const normalized = String(value).trim();

  if (!normalized || normalized.toLowerCase() === "guest") {
    return "";
  }

  return normalized;
};

const isCancelledOrder = (order) =>
  order.status?.toLowerCase() === "cancelled";

const isRevenueOrder = (order) => {
  const status = order.status?.toLowerCase();
  return status !== "cancelled" && status !== "failed";
};

const getUserEmail = (user) =>
  String(
    user.email ||
      user.emailAddress ||
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress ||
      ""
  )
    .trim()
    .toLowerCase();

const getUserName = (user) => {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    user.name ||
    user.fullName ||
    user.username ||
    fullName ||
    user.first_name ||
    user.last_name ||
    ""
  );
};

const getOrderCustomerName = (order) => {
  const firstName = order.firstName || "";
  const lastName = order.lastName || "";

  return (
    order.userName ||
    order.customerName ||
    order.address?.fullName ||
    order.shippingAddress?.fullName ||
    `${firstName} ${lastName}`.trim() ||
    order.userEmail ||
    order.customerEmail ||
    order.email ||
    order.user?.name ||
    order.user?.fullName ||
    ""
  );
};

const getOrderCustomerEmail = (order) =>
  String(
    order.userEmail ||
      order.customerEmail ||
      order.email ||
      order.user?.email ||
      ""
  )
    .trim()
    .toLowerCase();

const getOrderUserIds = (order) =>
  [
    order.userId,
    order.clerkId,
    order.customerId,
    order.user?.id,
    order.user?.clerkId,
    order.customer?.id,
    order.customer?.clerkId,
  ]
    .map(normalizeId)
    .filter(Boolean);

// ============================================================
// Date Filtering
// ============================================================

export const getDateRange = (filter) => {
  if (filter && typeof filter === "object") {
    const { startDate, endDate } = filter;

    const start = startDate
      ? new Date(`${startDate}T00:00:00`)
      : null;

    const end = endDate
      ? new Date(`${endDate}T23:59:59.999`)
      : null;

    return {
      start:
        start && !Number.isNaN(start.getTime())
          ? start
          : null,
      end:
        end && !Number.isNaN(end.getTime())
          ? end
          : null,
    };
  }

  const now = new Date();

  const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  switch (filter) {
    case "today":
      return {
        start: startOfDay(now),
        end: now,
      };

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };
    }

    case "7days": {
      const start = startOfDay(now);
      start.setDate(start.getDate() - 6);

      return { start, end: now };
    }

    case "30days": {
      const start = startOfDay(now);
      start.setDate(start.getDate() - 29);

      return { start, end: now };
    }

    case "thisWeek": {
      const start = startOfDay(now);
      start.setDate(
        start.getDate() - ((start.getDay() + 6) % 7)
      );

      return { start, end: now };
    }

    case "lastWeek": {
      const end = startOfDay(now);
      end.setDate(
        end.getDate() - ((end.getDay() + 6) % 7) - 1
      );

      const start = startOfDay(end);
      start.setDate(start.getDate() - 6);

      return {
        start,
        end: endOfDay(end),
      };
    }

    case "month": {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      start.setHours(0, 0, 0, 0);

      return { start, end: now };
    }

    case "lastMonth": {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      );

      return {
        start: startOfDay(start),
        end: endOfDay(end),
      };
    }

    case "3months": {
      const start = startOfDay(now);
      start.setMonth(start.getMonth() - 3);

      return { start, end: now };
    }

    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);

      return { start, end: now };
    }

    case "all":
    default:
      return { start: null, end: null };
  }
};

export const filterOrdersByDate = (orders, filter) => {
  if (!Array.isArray(orders)) return [];
  if (filter === "all" || !filter) return orders;

  const { start, end } = getDateRange(filter);

  if (!start && !end) return orders;

  return orders.filter((order) => {
    if (!order.createdAt) return false;

    const orderDate = new Date(order.createdAt);

    if (Number.isNaN(orderDate.getTime())) return false;
    if (start && orderDate < start) return false;
    if (end && orderDate > end) return false;

    return true;
  });
};

// ============================================================
// Sales Report
// ============================================================

export const getSalesReport = (orders) => {
  const safeOrders = Array.isArray(orders) ? orders : [];

  const totalOrders = safeOrders.length;

  const cancelledOrders = safeOrders.filter(
    isCancelledOrder
  ).length;

  const activeOrders = safeOrders.filter(
    (order) => !isCancelledOrder(order)
  );

  const revenueOrders = safeOrders.filter(isRevenueOrder);

  const totalRevenue = revenueOrders.reduce(
    (total, order) => total + getOrderTotal(order),
    0
  );

  const averageOrderValue =
    revenueOrders.length > 0
      ? totalRevenue / revenueOrders.length
      : 0;

  const processingOrders = safeOrders.filter(
    (order) => order.status?.toLowerCase() === "processing"
  ).length;

  const placedOrders = safeOrders.filter(
    (order) => order.status?.toLowerCase() === "placed"
  ).length;

  const shippedOrders = safeOrders.filter(
    (order) => order.status?.toLowerCase() === "shipped"
  ).length;

  const deliveredOrders = safeOrders.filter(
    (order) => order.status?.toLowerCase() === "delivered"
  ).length;

  const paymentMethods = {};

  revenueOrders.forEach((order) => {
    const method = order.paymentMethod || "unknown";

    paymentMethods[method] =
      (paymentMethods[method] || 0) +
      getOrderTotal(order);
  });

  return {
    totalOrders,
    activeOrders: activeOrders.length,
    cancelledOrders,
    processingOrders,
    placedOrders,
    shippedOrders,
    deliveredOrders,
    totalRevenue,
    averageOrderValue,
    paymentMethods,
  };
};

// ============================================================
// Sales Over Time
// ============================================================

export const getSalesOverTime = (orders) => {
  if (!Array.isArray(orders)) return [];

  const salesByDate = {};

  orders.filter(isRevenueOrder).forEach((order) => {
    if (!order.createdAt) return;

    const date = new Date(order.createdAt);

    if (Number.isNaN(date.getTime())) return;

    const dateKey = date.toISOString().split("T")[0];

    if (!salesByDate[dateKey]) {
      salesByDate[dateKey] = {
        date: dateKey,
        revenue: 0,
        orders: 0,
      };
    }

    salesByDate[dateKey].revenue += getOrderTotal(order);
    salesByDate[dateKey].orders += 1;
  });

  return Object.values(salesByDate).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

// ============================================================
// Product Report
// ============================================================

export const getProductReport = (orders, products) => {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const productMap = {};

  safeProducts.forEach((product) => {
    productMap[String(product.id)] = {
      productId: product.id,
      title: product.title || product.name || "Unknown Product",
      stock: toNumber(product.stock),
      unitsSold: 0,
      revenue: 0,
      orderCount: 0,
    };
  });

  safeOrders.filter(isRevenueOrder).forEach((order) => {
    if (!Array.isArray(order.items)) return;

    order.items.forEach((item) => {
      const productId = String(
        item.productId ?? item.id ?? ""
      );

      if (!productId) return;

      if (!productMap[productId]) {
        productMap[productId] = {
          productId: item.productId ?? item.id,
          title: item.title || item.name || "Unknown Product",
          stock: 0,
          unitsSold: 0,
          revenue: 0,
          orderCount: 0,
        };
      }

      const quantity = getItemQuantity(item);

      const revenue = toNumber(
        item.finalItemTotal ??
          item.originalItemTotal ??
          item.totalPrice ??
          0
      );

      productMap[productId].unitsSold += quantity;
      productMap[productId].revenue += revenue;
      productMap[productId].orderCount += 1;
    });
  });

  const productsReport = Object.values(productMap);

  const bestSellingProducts = [...productsReport]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);

  const highestRevenueProducts = [...productsReport]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const lowStockProducts = productsReport
    .filter((product) => product.stock <= 10)
    .sort((a, b) => a.stock - b.stock);

  return {
    products: productsReport,
    bestSellingProducts,
    highestRevenueProducts,
    lowStockProducts,
  };
};

// ============================================================
// Customer Report
// ============================================================

export const getCustomerReport = (orders, users) => {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const customerMap = new Map();
  const userLookup = new Map();

  safeUsers.forEach((user) => {
    const role = String(
      user.role || user.publicMetadata?.role || ""
    ).toLowerCase();

    if (role === "admin" || role === "administrator") {
      return;
    }

    const ids = [
      user.id,
      user.clerkId,
      user.userId,
    ]
      .map(normalizeId)
      .filter(Boolean);

    const email = getUserEmail(user);

    const customer = {
      userId: ids[0] || email,
      name: getUserName(user),
      email,
      orderCount: 0,
      totalSpent: 0,
    };

    ids.forEach((id) => {
      userLookup.set(id, customer);
    });

    if (email) {
      userLookup.set(`email:${email}`, customer);
    }
  });

  safeOrders.filter(isRevenueOrder).forEach((order) => {
    const ids = getOrderUserIds(order);
    const email = getOrderCustomerEmail(order);

    let customer = null;

    for (const id of ids) {
      customer = userLookup.get(id);
      if (customer) break;
    }

    if (!customer && email) {
      customer = userLookup.get(`email:${email}`);
    }

    const fallbackName = getOrderCustomerName(order);

    if (customer) {
      const identity = customer.email
        ? `email:${customer.email}`
        : `id:${normalizeId(customer.userId)}`;

      if (!customerMap.has(identity)) {
        customerMap.set(identity, customer);
      }

      customer = customerMap.get(identity);

      if (
        (!customer.name ||
          customer.name === "Unknown Customer") &&
        fallbackName
      ) {
        customer.name = fallbackName;
      }
    } else {
      const identity = email || ids[0] || fallbackName;

      if (!identity) return;

      const key = `unmatched:${identity}`;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          userId: ids[0] || identity,
          name: fallbackName || "Unknown Customer",
          email,
          orderCount: 0,
          totalSpent: 0,
        });
      }

      customer = customerMap.get(key);
    }

    customer.orderCount += 1;
    customer.totalSpent += getOrderTotal(order);
  });

  const customersReport = Array.from(customerMap.values());

  const activeCustomers = customersReport.filter(
    (customer) => customer.orderCount > 0
  );

  const topCustomersBySpending = [...activeCustomers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const topCustomersByOrders = [...activeCustomers]
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 10);

  const registeredCustomerKeys = new Set();

  safeUsers.forEach((user) => {
    const role = String(
      user.role || user.publicMetadata?.role || ""
    ).toLowerCase();

    if (role === "admin" || role === "administrator") {
      return;
    }

    const email = getUserEmail(user);
    const id = normalizeId(user.clerkId || user.userId || user.id);
    const key = email || id;

    if (key) registeredCustomerKeys.add(key);
  });

  return {
    customers: customersReport,
    totalCustomers: registeredCustomerKeys.size,
    activeCustomers: activeCustomers.length,
    topCustomersBySpending,
    topCustomersByOrders,
  };
};

// ============================================================
// Generate Complete Reports
// ============================================================

export const getReportsData = async (filter = "all") => {
  const [orders, products, users] = await Promise.all([
    getAllOrders(),
    getAllProducts(),
    getAllUsers(),
  ]);

  const filteredOrders = filterOrdersByDate(orders, filter);

  return {
    orders: filteredOrders,
    products,
    users,
    salesReport: getSalesReport(filteredOrders),
    salesOverTime: getSalesOverTime(filteredOrders),
    productReport: getProductReport(filteredOrders, products),
    customerReport: getCustomerReport(filteredOrders, users),
  };
};