
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClerkClient } from "@clerk/backend";

const app = express();

const PORT = process.env.PORT || 4000;

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ZanCart backend is running",
  });
});

/*
|--------------------------------------------------------------------------
| Get Clerk user
|--------------------------------------------------------------------------
*/

app.get("/api/admin/users/:clerkUserId", async (req, res) => {
  try {
    const { clerkUserId } = req.params;

    const user = await clerkClient.users.getUser(
      clerkUserId,
    );

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Failed to fetch Clerk user:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch Clerk user",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Enable / Disable Admin Access
|--------------------------------------------------------------------------
*/

app.patch(
  "/api/admin/users/:clerkUserId/role",
  async (req, res) => {
    try {
      const { clerkUserId } = req.params;
      const { role } = req.body;

      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({
          success: false,
          message:
            'Role must be either "admin" or "user".',
        });
      }

      const updatedUser =
        await clerkClient.users.updateUserMetadata(
          clerkUserId,
          {
            publicMetadata: {
              role,
            },
          },
        );

      res.json({
        success: true,
        message:
          role === "admin"
            ? "Admin access enabled."
            : "Admin access disabled.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Failed to update admin role:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update admin access.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `ZanCart backend running on http://localhost:${PORT}`,
  );
});
