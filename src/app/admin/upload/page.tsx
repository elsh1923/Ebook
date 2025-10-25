"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null); // PDF file
  const [coverImage, setCoverImage] = useState<File | null>(null); // Cover image
  const [fileUrl, setFileUrl] = useState(""); // Cloudinary URL for PDF
  const [coverImageUrl, setCoverImageUrl] = useState(""); // Cloudinary URL for cover
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = ["Programming", "Design", "Marketing", "Fiction", "AI/ML", "Finance", "Business", "Technology"];

  // Utility: Upload file to Cloudinary
  const uploadToCloudinary = async (file: File, folder: string) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: base64Data, folder }),
          });
          const data = await res.json();
          if (data.success) resolve(data.url);
          else reject(new Error(data.message || "Cloudinary upload failed"));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("File read error"));
    });
  };

  const handleUploadBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login as admin first");
      setLoading(false);
      return;
    }

    try {
      // Upload PDF if selected
      let uploadedFileUrl = fileUrl;
      if (file) {
        uploadedFileUrl = await uploadToCloudinary(file, "ebooks");
        setFileUrl(uploadedFileUrl);
      }

      // Upload cover image if selected
      let uploadedCoverUrl = coverImageUrl;
      if (coverImage) {
        uploadedCoverUrl = await uploadToCloudinary(coverImage, "ebook_covers");
        setCoverImageUrl(uploadedCoverUrl);
      }

      // Submit full book data
      const res = await fetch("/api/books/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          author,
          price: Number(price),
          fileUrl: uploadedFileUrl,
          coverImageUrl: uploadedCoverUrl,
          description,
          category,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Book uploaded successfully!");
        // Reset form
        setTitle("");
        setAuthor("");
        setPrice("");
        setFile(null);
        setCoverImage(null);
        setFileUrl("");
        setCoverImageUrl("");
        setDescription("");
        setCategory("");
      } else {
        setError(data.error || "Error uploading book");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 shadow-2xl p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow">
                  EB
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xl">E-Library</span>
              </Link>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload New Book</h2>
              <p className="text-slate-600 dark:text-slate-300">Add a new book to the library</p>
            </div>

            {error && <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>}

            {message && <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-green-600 dark:text-green-400 text-sm">{message}</p>
            </div>}

            <form onSubmit={handleUploadBook} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter book description"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Book File (PDF) *
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                {fileUrl && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Uploaded file URL: <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">{fileUrl}</a>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cover Image
                </label>
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                {coverImageUrl && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Uploaded cover URL: <a href={coverImageUrl} target="_blank" rel="noreferrer" className="underline">{coverImageUrl}</a>
                  </p>
                )}
              </div>

              {/* Remaining form inputs stay the same */}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Book"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-100 hover:bg-indigo-50 dark:hover:bg-indigo-800/40 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
