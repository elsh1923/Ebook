// import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { connectDB } from "../lib/mongodb";

async function createAdmin() {
  await connectDB();

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = new User({
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });
  
  await admin.save();
  console.log("✅ Admin created successfully");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});
