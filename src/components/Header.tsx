"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Decode token payload to get user info (simple approach)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ name: payload.name, role: payload.role });
    } catch {
      console.error("Invalid token");
      localStorage.removeItem("token");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login"; // redirect to login
  };

  return (
    <header className="backdrop-blur-md sticky top-0 z-40 bg-white/60 dark:bg-slate-900/60 border-b border-white/10 dark:border-slate-800/40">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow">
            EB
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">E-Library</span>
        </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-700 dark:text-slate-200 hover:underline">Home</Link>
            <Link href="/books" className="text-slate-700 dark:text-slate-200 hover:underline">Books</Link>
            {user && <Link href="/profile" className="text-slate-700 dark:text-slate-200 hover:underline">Profile</Link>}
            {user?.role === "admin" && (
              <Link href="/admin/upload" className="text-slate-700 dark:text-slate-200 hover:underline">Upload</Link>
            )}
            {!user && (
              <>
                <Link href="/login" className="text-slate-700 dark:text-slate-200 hover:underline">Login</Link>
                <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition">Register</Link>
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800/40 transition"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-md bg-white/60 dark:bg-slate-800/50 border border-white/10"
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? (
              <svg className="w-5 h-5 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-white/60 dark:bg-slate-900/60">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
            <Link href="/" className="py-2 text-slate-700 dark:text-slate-200">Home</Link>
            <Link href="/books" className="py-2 text-slate-700 dark:text-slate-200">Books</Link>
            {user && <Link href="/profile" className="py-2 text-slate-700 dark:text-slate-200">Profile</Link>}
            {user?.role === "admin" && (
              <Link href="/admin/upload" className="py-2 text-slate-700 dark:text-slate-200">Upload</Link>
            )}
            {!user && (
              <>
                <Link href="/login" className="py-2 text-slate-700 dark:text-slate-200">Login</Link>
                <Link href="/register" className="py-2 text-slate-700 dark:text-slate-200">Register</Link>
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="py-2 text-left text-red-600 dark:text-red-400"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
