
import bcrypt from "bcryptjs";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFile = path.join(__dirname, "data/users.json");

// ------------------------------------------------------------
// Admin credentials
// ------------------------------------------------------------

const adminName = "ZanCart Admin";
const adminEmail = "admin@zancart.com";
const adminPassword = "Admin@123456";

// ------------------------------------------------------------
// Read existing users
// ------------------------------------------------------------

async function getUsers() {
  try {
    const data = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// Create admin
// ------------------------------------------------------------

async function seedAdmin() {
  const users = await getUsers();

  const existingAdmin = users.find(
    (user) => user.email.toLowerCase() === adminEmail.toLowerCase(),
  );

  if (existingAdmin) {
    console.log("Admin account already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = {
    id: `usr_admin_${Date.now()}`,
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    role: "admin",
    isBlocked: false,
    createdAt: new Date().toISOString(),
  };

  users.push(admin);

  await fs.writeFile(
    usersFile,
    JSON.stringify(users, null, 2),
  );

  console.log("Admin account created successfully.");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

seedAdmin().catch((error) => {
  console.error("Failed to create admin:", error);
});