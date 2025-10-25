import mongoose, { Schema, model, models } from "mongoose";

const readingProgressSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  currentPage: { type: Number, required: true, default: 1 },
  totalPages: { type: Number, required: true },
  lastReadAt: { type: Date, default: Date.now },
  readingTime: { type: Number, default: 0 }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index to ensure one progress record per user per book
readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// Update the updatedAt field before saving
readingProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Prevent re-compilation errors
const ReadingProgress = models.ReadingProgress || model("ReadingProgress", readingProgressSchema);
export default ReadingProgress;

