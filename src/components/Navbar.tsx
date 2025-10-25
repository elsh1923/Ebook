// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="backdrop-blur-md sticky top-0 z-40 bg-white/60 dark:bg-slate-900/60 border-b border-white/10 dark:border-slate-800/40">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow">
            EB
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">E-Library</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/books" className="text-slate-700 dark:text-slate-200 hover:underline">Books</Link>
          <Link href="/about" className="text-slate-700 dark:text-slate-200 hover:underline">About</Link>
          <Link href="/pricing" className="text-slate-700 dark:text-slate-200 hover:underline">Pricing</Link>
          <ThemeToggle />
        </nav>

        {/* mobile */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button aria-label="Open menu" onClick={() => setOpen(!open)} className="p-2 rounded-md bg-white/60 dark:bg-slate-800/50 border border-white/10">
            <svg className="w-5 h-5 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="none">
              <path d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-white/60 dark:bg-slate-900/60">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
            <Link href="/books" className="py-2">Books</Link>
            <Link href="/about" className="py-2">About</Link>
            <Link href="/pricing" className="py-2">Pricing</Link>
          </div>
        </div>
      )}
    </header>
  );
}
