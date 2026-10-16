
import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersFile = path.join(__dirname, "data/users.json");

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  const email = "admin@zancart.com";
  const password = await rl.question("Enter a NEW admin password: ");

  if (password.length < 12) {
    throw new Error("Password must contain at least 12 characters.");
  }

  const confirmation = await rl.question("Confirm the new password: ");

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  const users = JSON.parse(await fs.readFile(usersFile, "utf8"));
  const admin = users.find(
    (user) => user.email?.toLowerCase() === email
  );

  if (!admin || admin.role !== "admin") {
    throw new Error("Existing admin account not found; no changes made.");
  }

  admin.password = await bcrypt.hash(password, 12);
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2) + "\n");

  console.log(`Password reset successfully for ${email}.`);
  console.log("Existing admin ID and role were preserved.");
} catch (error) {
  console.error("Password reset failed:", error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
