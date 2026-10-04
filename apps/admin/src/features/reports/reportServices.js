
import api from "../../services/api";

// ============================================================
// Fetch all orders
// ============================================================
export const getAllOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// ============================================================
// Fetch all products
// ============================================================
export const getAllProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

// ============================================================
// Fetch all users
// ============================================================
export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// ============================================================
// Helper: Convert value to a safe number
// ============================================================
const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// ============================================================
// Helper: Get order total
// ============================================================
const getOrderTotal = (order) => {
  return toNumber(order.totalAmount);
};

// ============================================================
// Helper: Get actual inventory quantity
// ============================================================
const getItemQuantity = (item) => {
  const paidQuantity = toNumber(
    item.paidQuantity ?? item.quantity ?? 0,
  );

  const freeQuantity = toNumber(
    item.freeQuantity ?? 0,
  );

  return paidQuantity + freeQuantity;
};

// ============================================================
// Helper: Check cancelled order
// ============================================================
const isCancelledOrder = (order) => {
  return (
    order.status?.toLowerCase() ===
    "cancelled"
  );
};

// ============================================================
// Helper: Check whether order contributes to revenue
// ============================================================
const isRevenueOrder = (order) => {
  const status =
    order.status?.toLowerCase();

  return (
    status !== "cancelled" &&
    status !== "failed"
  );
};

// ============================================================
// DATE FILTERING
// ============================================================

export const getDateRange = (filter) => {
  const now = new Date();

  switch (filter) {
    case "today": {
      const start = new Date(now);

      start.setHours(0, 0, 0, 0);

      return {
        start,
        end: now,
      };
    }

    case "7days": {
      const start = new Date(now);

      start.setDate(
        start.getDate() - 6,
      );

      start.setHours(0, 0, 0, 0);

      return {
        start,
        end: now,
      };
    }

    case "30days": {
      const start = new Date(now);

      start.setDate(
        start.getDate() - 29,
      );

      start.setHours(0, 0, 0, 0);

      return {
        start,
        end: now,
      };
    }

    case "month": {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

      start.setHours(0, 0, 0, 0);

      return {
        start,
        end: now,
      };
    }

    case "all":
    default:
      return {
        start: null,
        end: null,
      };
  }
};

// ============================================================
// Filter orders by date
// ============================================================
export const filterOrdersByDate = (
  orders,
  filter,
) => {
  if (!Array.isArray(orders)) {
    return [];
  }

  if (filter === "all") {
    return orders;
  }

  const {
    start,
    end,
  } = getDateRange(filter);

  if (!start || !end) {
    return orders;
  }

  return orders.filter((order) => {
    if (!order.createdAt) {
      return false;
    }

    const orderDate = new Date(
      order.createdAt,
    );

    return (
      orderDate >= start &&
      orderDate <= end
    );
  });
};

// ============================================================
// Sales Report
// ============================================================
export const getSalesReport = (
  orders,
) => {
  const safeOrders = Array.isArray(
    orders,
  )
    ? orders
    : [];

  const totalOrders =
    safeOrders.length;

  const cancelledOrders =
    safeOrders.filter(
      isCancelledOrder,
    ).length;

  const activeOrders =
    safeOrders.filter(
      (order) =>
        !isCancelledOrder(order),
    );

  const revenueOrders =
    safeOrders.filter(
      isRevenueOrder,
    );

  const totalRevenue =
    revenueOrders.reduce(
      (total, order) =>
        total +
        getOrderTotal(order),
      0,
    );

  const averageOrderValue =
    revenueOrders.length > 0
      ? totalRevenue /
        revenueOrders.length
      : 0;

  const processingOrders =
    safeOrders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "processing",
    ).length;

  const placedOrders =
    safeOrders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "placed",
    ).length;

  const shippedOrders =
    safeOrders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "shipped",
    ).length;

  const deliveredOrders =
    safeOrders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        "delivered",
    ).length;

  const paymentMethods = {};

  revenueOrders.forEach((order) => {
    const method =
      order.paymentMethod ||
      "unknown";

    paymentMethods[method] =
      (paymentMethods[method] || 0) +
      getOrderTotal(order);
  });

  return {
    totalOrders,
    activeOrders:
      activeOrders.length,
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
export const getSalesOverTime = (
  orders,
) => {
  if (!Array.isArray(orders)) {
    return [];
  }

  const salesByDate = {};

  orders
    .filter(isRevenueOrder)
    .forEach((order) => {
      if (!order.createdAt) {
        return;
      }

      const date = new Date(
        order.createdAt,
      );

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const dateKey = date
        .toISOString()
        .split("T")[0];

      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
        };
      }

      salesByDate[dateKey].revenue +=
        getOrderTotal(order);

      salesByDate[dateKey].orders +=
        1;
    });

  return Object.values(
    salesByDate,
  ).sort(
    (a, b) =>
      new Date(a.date) -
      new Date(b.date),
  );
};

// ============================================================
// Product Report
// ============================================================
export const getProductReport = (
  orders,
  products,
) => {
  const safeOrders = Array.isArray(
    orders,
  )
    ? orders
    : [];

  const safeProducts =
    Array.isArray(products)
      ? products
      : [];

  const productMap = {};

  // ----------------------------------------------------------
  // Initialize products
  // ----------------------------------------------------------
  safeProducts.forEach((product) => {
    productMap[String(product.id)] = {
      productId: product.id,
      title:
        product.title ||
        "Unknown Product",
      stock: toNumber(
        product.stock,
      ),
      unitsSold: 0,
      revenue: 0,
      orderCount: 0,
    };
  });

  // ----------------------------------------------------------
  // Calculate product sales
  // ----------------------------------------------------------
  safeOrders
    .filter(isRevenueOrder)
    .forEach((order) => {
      if (!Array.isArray(order.items)) {
        return;
      }

      order.items.forEach((item) => {
        const productId = String(
          item.productId,
        );

        if (!productMap[productId]) {
          productMap[productId] = {
            productId:
              item.productId,
            title:
              item.title ||
              "Unknown Product",
            stock: 0,
            unitsSold: 0,
            revenue: 0,
            orderCount: 0,
          };
        }

        const quantity =
          getItemQuantity(item);

        const revenue = toNumber(
          item.finalItemTotal ??
            item.originalItemTotal ??
            0,
        );

        productMap[
          productId
        ].unitsSold += quantity;

        productMap[
          productId
        ].revenue += revenue;

        productMap[
          productId
        ].orderCount += 1;
      });
    });

  const productsReport =
    Object.values(productMap);

  const bestSellingProducts = [
    ...productsReport,
  ]
    .sort(
      (a, b) =>
        b.unitsSold -
        a.unitsSold,
    )
    .slice(0, 10);

  const highestRevenueProducts = [
    ...productsReport,
  ]
    .sort(
      (a, b) =>
        b.revenue -
        a.revenue,
    )
    .slice(0, 10);

  const lowStockProducts =
    productsReport
      .filter(
        (product) =>
          product.stock <= 10,
      )
      .sort(
        (a, b) =>
          a.stock - b.stock,
      );

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
export const getCustomerReport = (
  orders,
  users,
) => {
  const safeOrders = Array.isArray(
    orders,
  )
    ? orders
    : [];

  const safeUsers = Array.isArray(
    users,
  )
    ? users
    : [];

  const customerMap = {};

  // ----------------------------------------------------------
  // Initialize users
  // ----------------------------------------------------------
  safeUsers.forEach((user) => {
    customerMap[String(user.id)] = {
      userId: user.id,
      name:
        user.name ||
        user.fullName ||
        user.username ||
        "Unknown Customer",
      email: user.email || "",
      orderCount: 0,
      totalSpent: 0,
    };
  });

  // ----------------------------------------------------------
  // Calculate customer spending
  // ----------------------------------------------------------
  safeOrders
    .filter(isRevenueOrder)
    .forEach((order) => {
      const userId =
        order.userId;

      if (!userId) {
        return;
      }

      const key = String(userId);

      if (!customerMap[key]) {
        customerMap[key] = {
          userId,
          name: "Unknown Customer",
          email: "",
          orderCount: 0,
          totalSpent: 0,
        };
      }

      customerMap[key].orderCount +=
        1;

      customerMap[key].totalSpent +=
        getOrderTotal(order);
    });

  const customersReport =
    Object.values(customerMap);

  const activeCustomers =
    customersReport.filter(
      (customer) =>
        customer.orderCount > 0,
    );

  const topCustomersBySpending = [
    ...activeCustomers,
  ]
    .sort(
      (a, b) =>
        b.totalSpent -
        a.totalSpent,
    )
    .slice(0, 10);

  const topCustomersByOrders = [
    ...activeCustomers,
  ]
    .sort(
      (a, b) =>
        b.orderCount -
        a.orderCount,
    )
    .slice(0, 10);

  return {
    customers: customersReport,
    totalCustomers:
      safeUsers.length,
    activeCustomers:
      activeCustomers.length,
    topCustomersBySpending,
    topCustomersByOrders,
  };
};

// ============================================================
// Generate Complete Reports
// ============================================================
export const getReportsData = async (
  filter = "all",
) => {
  const [
    orders,
    products,
    users,
  ] = await Promise.all([
    getAllOrders(),
    getAllProducts(),
    getAllUsers(),
  ]);

  const filteredOrders =
    filterOrdersByDate(
      orders,
      filter,
    );

  return {
    orders: filteredOrders,

    products,

    users,

    salesReport:
      getSalesReport(
        filteredOrders,
      ),

    salesOverTime:
      getSalesOverTime(
        filteredOrders,
      ),

    productReport:
      getProductReport(
        filteredOrders,
        products,
      ),

    customerReport:
      getCustomerReport(
        filteredOrders,
        users,
      ),
  };
};