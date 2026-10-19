import express from "express";

import {
  changeUserPassword,
  changeOwnPassword,
  createCustomerByAdmin,
  getAllAuthUsers,
  getAuthServiceErrorStatus,
  getUserByEmail,
  getUserById,
  updateUserRole,
  updateUserBlockedStatus,
  updateOwnProfile,
} from "../services/authService.js";

import { requireAdmin, requireSuperAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createProductUploadSignature,
} from "../services/cloudinaryService.js";

const router = express.Router();

router.get("/profile", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
});

router.patch("/profile", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await updateOwnProfile(req.user.userId, req.body);
    return res.json({ success: true, message: "Profile updated successfully.", user });
  } catch (error) {
    const status = getAuthServiceErrorStatus(error);
    return res.status(status).json({ success: false, message: error.message || "Failed to update profile." });
  }
});

router.patch("/profile/password", requireAuth, requireAdmin, async (req, res) => {
  try {
    await changeOwnPassword(req.user.userId, req.body?.currentPassword, req.body?.newPassword);
    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    const status = error.message === "Current password is incorrect." ? 400 : getAuthServiceErrorStatus(error);
    return res.status(status).json({ success: false, message: error.message || "Failed to change password." });
  }
});

/*
|--------------------------------------------------------------------------
| Update User Role
|--------------------------------------------------------------------------
| PATCH /api/admin/users/role
|
| Body:
| {
|   "email": "user@example.com",
|   "role": "admin"
| }
|--------------------------------------------------------------------------
*/

router.patch(
  "/users/role",
  requireAuth,
   requireSuperAdmin,
  async (req, res) => {
    try {
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "User email is required.",
        });
      }

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message:
            "Role must be either user or admin.",
        });
      }

      const targetUser =
        await getUserByEmail(email);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message:
            "This user does not have a custom authentication account.",
        });
      }

      // Prevent removing your own admin access.
      if (
        req.user?.userId === targetUser.id &&
        role === "user"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot remove your own admin access.",
        });
      }

      const updatedUser =
        await updateUserRole(
          targetUser.id,
          role
        );

      return res.status(200).json({
        success: true,
        message:
          role === "admin"
            ? "Admin access enabled."
            : "Admin access removed.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Failed to update user role:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update user role.",
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| Change User Password
|--------------------------------------------------------------------------
| PATCH /api/admin/users/change-password
|
| Body:
| {
|   "email": "user@example.com",
|   "newPassword": "NewPassword123"
| }
|--------------------------------------------------------------------------
*/

router.patch(
  "/users/change-password",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "User email is required.",
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password is required.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      const targetUser =
        await getUserByEmail(email);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message:
            "This user does not have a custom authentication account.",
        });
      }

      /*
       * IMPORTANT:
       * There is intentionally NO check here
       * preventing an admin from changing their
       * own password.
       */

      const updatedUser =
        await changeUserPassword(
          email,
          newPassword
        );

      return res.status(200).json({
        success: true,
        message:
          "Password changed successfully.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Failed to change user password:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to change password.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Generate Cloudinary Product Upload Signature
|--------------------------------------------------------------------------
| POST /api/admin/uploads/signature
|--------------------------------------------------------------------------
*/

router.post(
  "/uploads/signature",
  requireAuth,
  requireAdmin,
  (req, res) => {
    try {
      const folder = req.body?.folder ?? "zancart/products";

      const uploadData =
        createProductUploadSignature(folder);

      return res.status(200).json({
        success: true,
        upload: uploadData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Unable to prepare image upload.",
      });
    }
  },
);

router.post(
  "/users",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const user = await createCustomerByAdmin(req.body);

      return res.status(201).json({
        success: true,
        message: "User created successfully.",
        user,
      });
    } catch (error) {
      const status = getAuthServiceErrorStatus(error);

      return res.status(status).json({
        success: false,
        message: status < 500
          ? error.message
          : "Failed to create user.",
      });
    }
  },
);

router.get(
  "/users",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await getAllAuthUsers();

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Failed to fetch auth users:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch users.",
      });
    }
  },
);

router.get(
  "/users/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const user = await getUserById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Failed to fetch auth user:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch user.",
      });
    }
  },
);

router.patch(
  "/users/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const isBlocked =
        req.body?.isBlocked === true || req.body?.status === "blocked";

      if (
        req.body?.isBlocked !== true &&
        req.body?.isBlocked !== false &&
        req.body?.status !== "active" &&
        req.body?.status !== "blocked"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid status.",
        });
      }

      if (req.user?.userId === req.params.id && isBlocked) {
        return res.status(400).json({
          success: false,
          message: "You cannot block your own account.",
        });
      }

      const user = await updateUserBlockedStatus(req.params.id, isBlocked);

      return res.status(200).json({
        success: true,
        message: isBlocked
          ? "User blocked successfully."
          : "User unblocked successfully.",
        user,
      });
    } catch (error) {
      const status =
        error.message === "User not found."
          ? 404
          : getAuthServiceErrorStatus(error);

      return res.status(status).json({
        success: false,
        message:
          status < 500
            ? error.message
            : "Failed to update user status.",
      });
    }
  },
);

export default router;
