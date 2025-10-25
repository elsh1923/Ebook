import mongoose, { Schema, model, models } from "mongoose";

const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  fileUrl: { type: String, required: true }, // path to PDF or eBook file
  coverImageUrl: { type: String },          // optional cover image
  category: { type: String, required: true }, // book category
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who uploaded
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
bookSchema.index({ createdAt: -1 }); // For sorting by newest
bookSchema.index({ category: 1 }); // For filtering by category
bookSchema.index({ title: 'text', author: 'text', description: 'text' }); // For text search
bookSchema.index({ price: 1 }); // For price sorting

// Prevent re-compilation errors
const Book = models.Book || model("Book", bookSchema);
export default Book;
