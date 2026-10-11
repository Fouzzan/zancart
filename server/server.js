
import cors from "cors";
import "dotenv/config";
import express from "express";

import adminRoutes from "./routes/adminRoutes.js";
import { requireAdmin } from "./middleware/requireAdmin.js";
import { requireAuth } from "./middleware/requireAuth.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

const PORT = process.env.PORT || 4000;


// Middleware


app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

//Health Check

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ZanCart backend is running",
  });
});

// ------------------------------------------------------------
// Authentication Routes
// ------------------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// ------------------------------------------------------------
// Temporary Admin Protected Route
// Used to test requireAuth + requireAdmin
// ------------------------------------------------------------

app.get(
  "/api/admin-test",
  requireAuth,
  requireAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted.",
      user: req.user,
    });
  }
);

// ------------------------------------------------------------
// 404 Route
// ------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ------------------------------------------------------------
// Error Handler
// ------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `ZanCart backend running on http://localhost:${PORT}`
  );
});