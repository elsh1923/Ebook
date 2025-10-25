"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    try {
      console.log("Attempting login with:", { email, password: "***" });
      
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", res.status);
      const data = await res.json();
      console.log("Login response data:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        const role = data?.user?.role;
        console.log("Login successful, user role:", role);
        console.log("User data:", data.user);
        
        if (role === "admin") {
          console.log("Redirecting admin to upload page");
          window.location.href = "/admin/upload";
        } else {
          console.log("Redirecting user to profile page");
          window.location.href = "/profile";
        }
      } else {
        console.error("Login failed:", data.error);
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-28 w-96 h-96 rounded-full opacity-30 blur-3xl bg-gradient-to-tr from-violet-400 to-indigo-500 animate-slow-float"></div>
        <div className="absolute right-8 top-1/3 w-72 h-72 rounded-full opacity-20 blur-2xl bg-gradient-to-br from-cyan-400 to-blue-500 animate-tilt"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 shadow-2xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow">
                  EB
                </div>
                <span className="font-semibold text-slate-900 dark:text-white text-xl">E-Library</span>
              </Link>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
              <p className="text-slate-600 dark:text-slate-300">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition font-medium"
              >
                Sign in
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600 dark:text-slate-300">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-indigo-600 dark:text-cyan-300 hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
