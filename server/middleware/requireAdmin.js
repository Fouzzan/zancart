export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const role = String(req.user.role || "").trim().toLowerCase();

  if (!["admin", "superadmin"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const role = String(req.user.role || "").trim().toLowerCase();

  if (role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Only a Super Admin can change administrator access.",
    });
  }

  next();
}