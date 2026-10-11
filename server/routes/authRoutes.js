
import express from "express";

import {
  getUserById,
  loginUser,
  registerUser,
} from "../services/authService.js";

import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ------------------------------------------------------------
// Test authentication routes
// GET /api/auth/test
// ------------------------------------------------------------

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
  });
});

// ------------------------------------------------------------
// Register
// POST /api/auth/register
// ------------------------------------------------------------

router.post("/register", async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ------------------------------------------------------------
// Login
// POST /api/auth/login
// ------------------------------------------------------------

router.post("/login", async (req, res) => {
  try {
    const result = await loginUser(req.body);

    res.json({
      success: true,
      message: "Login successful.",
      ...result,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// ------------------------------------------------------------
// Get current authenticated user
// GET /api/auth/me
// ------------------------------------------------------------

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get current user.",
    });
  }
});

// ------------------------------------------------------------
// Temporary admin authorization test
// GET /api/auth/admin-test
// ------------------------------------------------------------

router.get(
  "/admin-test",
  requireAuth,
  requireAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted.",
      user: req.user,
    });
  },
);

export default router;
