"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Book { 
  _id: string; 
  title: string; 
  author: string; 
  fileUrl: string; 
  coverImageUrl?: string;
  price: number;
  description?: string;
  category?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Profile page loading...");
    const token = localStorage.getItem("token");
    console.log("Token found:", !!token);
    
    if (!token) {
      console.log("No token found, redirecting to login");
      setError("Please login first");
      setLoading(false);
      return;
    }

    console.log("Fetching profile data...");
    fetch("/api/users/profile", { 
      headers: { "Authorization": `Bearer ${token}` } 
    })
      .then(res => {
        console.log("Profile API response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Profile API response data:", data);
        if (data.error) {
          console.error("Profile API error:", data.error);
          setError(data.error);
        } else {
          console.log("Profile data loaded successfully");
          setUser(data.user);
          setBooks(data.purchasedBooks || []);
        }
      })
      .catch((error) => {
        console.error("Profile fetch error:", error);
        setError("Failed to fetch profile");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition"
          >
            Go to Login
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
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            My Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Welcome back, {user?.name}! Manage your purchased books and account settings.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-slate-600 dark:text-slate-300">{user?.email}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{books.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Purchased Books</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${books.reduce((total, book) => total + book.price, 0).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Total Spent</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{user?.role}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Account Type</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchased Books Section */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Library</h2>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-100 hover:bg-indigo-50 dark:hover:bg-indigo-800/40 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Browse More Books
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No books purchased yet</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Start building your digital library by purchasing some amazing books!
              </p>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book._id} className="group rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-700/40 border border-white/10 dark:border-white/6 shadow-lg transform transition hover:-translate-y-2">
                  <div className="relative h-48">
                    <Image
                      src={book.coverImageUrl || "/window.svg"}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Purchased
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{book.author}</p>
                    {book.category && (
                      <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full mb-3">
                        {book.category}
                      </span>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                      {book.description || "No description available"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${book.price.toFixed(2)}
                      </span>
                      <Link
                        href={`/dashboard/read/${book._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-medium rounded-lg shadow hover:scale-[1.02] transform transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Read Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
