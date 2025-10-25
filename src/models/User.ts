// src/models/User.ts
import mongoose, { Schema, model, models } from "mongoose";
import "./Book"; // <-- Add this line to register the Book model

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model("User", userSchema);
export default User;
