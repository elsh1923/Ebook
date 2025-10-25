// components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // 'light' default per your preference
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // load stored preference
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    } else {
      // no pref stored: default light
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggle = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-white/60 dark:bg-slate-800/50"
    >
      {theme === "light" ? (
        <>
          <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-sm text-slate-800">Light</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-slate-200">Dark</span>
        </>
      )}
    </button>
  );
}
