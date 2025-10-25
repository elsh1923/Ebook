"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setError(data.error || "Registration failed");
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
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
              <p className="text-slate-600 dark:text-slate-300">Join our community of readers</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-green-600 dark:text-green-400 text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
        <input
          type="text"
                  id="name"
          name="name"
                  placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email address
                </label>
        <input
          type="email"
                  id="email"
          name="email"
                  placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
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
          name="password"
                  placeholder="Create a password"
          value={form.password}
          onChange={handleChange}
          required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
              </div>

        <button
          type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition font-medium"
        >
                Create Account
        </button>
      </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 dark:text-cyan-300 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
