"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  coverImageUrl?: string;
  description?: string;
  category?: string;
  fileUrl: string;
  createdAt: string;
}

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setBook(data);
        } else {
          setError("Book not found");
        }
      } catch {
        setError("Failed to fetch book details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBook();
    }
  }, [params.id]);

  const handleBuyClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to purchase books");
      router.push("/login");
      return;
    }
    
    if (!book) return;
    
    // Navigate to payment page with book details
    const bookData = encodeURIComponent(JSON.stringify({
      id: book._id,
      title: book.title,
      author: book.author,
      price: book.price,
      image: book.coverImageUrl || "/window.svg"
    }));
    
    router.push(`/payment?book=${bookData}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Book Not Found</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{error || "The book you're looking for doesn't exist."}</p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-28 w-96 h-96 rounded-full opacity-30 blur-3xl bg-gradient-to-tr from-violet-400 to-indigo-500 animate-slow-float"></div>
        <div className="absolute right-8 top-1/3 w-72 h-72 rounded-full opacity-20 blur-2xl bg-gradient-to-br from-cyan-400 to-blue-500 animate-tilt"></div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Books
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Book Cover */}
            <div className="space-y-6">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={book.coverImageUrl || "/window.svg"}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{book.title}</h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-4">by {book.author}</p>
                
                {book.category && (
                  <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full mb-4">
                    {book.category}
                  </span>
                )}
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-cyan-300">${book.price.toFixed(2)}</span>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Added {new Date(book.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={handleBuyClick}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-4 rounded-lg shadow-lg hover:scale-[1.02] transform transition font-medium text-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Buy Now
                </button>
              </div>

              {book.description && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Description</h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{book.description}</p>
                </div>
              )}

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Book Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Author:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{book.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Price:</span>
                    <span className="text-slate-900 dark:text-white font-medium">${book.price.toFixed(2)}</span>
                  </div>
                  {book.category && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Category:</span>
                      <span className="text-slate-900 dark:text-white font-medium">{book.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Added:</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
