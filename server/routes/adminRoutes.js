import express from "express";

import {
  changeUserPassword,
  getUserByEmail,
  updateUserRole,
} from "../services/authService.js";

import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createProductUploadSignature,
} from "../services/cloudinaryService.js";

const router = express.Router();

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
  requireAdmin,
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

export default router;