"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import dynamic from "next/dynamic";

// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300">Loading PDF viewer...</p>
      </div>
    </div>
  ),
});

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

// Set up PDF.js worker only on client side
if (typeof window !== "undefined") {
  import("react-pdf").then((pdfjs) => {
    pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  });
}

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  coverImageUrl?: string;
  fileUrl?: string;
  description?: string;
  category?: string;
}

interface ReadingProgress {
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: Date;
}

export default function PDFReader() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication and load book data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadBookData = async () => {
      try {
        // Load book details
        const bookResponse = await fetch(`/api/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!bookResponse.ok) {
          throw new Error("Failed to load book");
        }
        
        const bookData = await bookResponse.json();
        setBook(bookData);

        // Load reading progress
        const progressResponse = await fetch(`/api/users/saveProgress?bookId=${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData.progress) {
            setProgress(progressData.progress);
            setCurrentPage(progressData.progress.currentPage);
          }
        }

        setIsPdfReady(true);
      } catch (err) {
        console.error("Error loading book:", err);
        setError("Failed to load book. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadBookData();
  }, [bookId, router]);

  // Check for dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark" || 
                   (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
  }, []);

  // Disable right-click, keyboard shortcuts, and text selection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common shortcuts
      if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'a' || e.key === 'c')) {
        e.preventDefault();
      }
      // Disable F12, Ctrl+Shift+I, etc.
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };
    const handleSelectStart = (e: Event) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  const getPdfUrl = () => {
    const token = localStorage.getItem("token");
    return `/api/books/${bookId}/pdf?token=${token}`;
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (progress && progress.currentPage > 1) {
      setCurrentPage(progress.currentPage);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    
    // Save progress
    const token = localStorage.getItem("token");
    if (token && book) {
      try {
        await fetch("/api/users/saveProgress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            bookId: book._id,
            currentPage: newPage,
            totalPages: numPages
          })
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  const handleBackToProfile = () => {
    router.push("/profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading PDF reader...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error Loading Book</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
          <button
            onClick={handleBackToProfile}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-100"} transition-colors duration-300`}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToProfile}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </button>
            {book && (
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate max-w-md">
                  {book.title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">{book.author}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Scale Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScaleChange(Math.max(0.5, scale - 0.1))}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                title="Decrease zoom"
                aria-label="Decrease zoom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => handleScaleChange(Math.min(2.0, scale + 0.1))}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                title="Increase zoom"
                aria-label="Increase zoom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="pt-20 pb-8 flex justify-center">
        {!isClient ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Initializing PDF viewer...</p>
            </div>
          </div>
        ) : isPdfReady ? (
          <Document
            file={getPdfUrl()}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-300">Loading PDF...</p>
                </div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Failed to Load PDF</h3>
                  <p className="text-slate-600 dark:text-slate-300">Please check your connection and try again.</p>
                </div>
              </div>
            }
          >
            {numPages > 0 && (
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="pdf-page shadow-lg"
              />
            )}
          </Document>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Preparing PDF viewer...</p>
            </div>
          </div>
        )}
      </div>

      {/* Watermark Overlay */}
      <WatermarkOverlay />

      {/* Navigation and Progress */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Previous page"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= numPages) {
                handlePageChange(page);
              }
            }}
            className="w-16 px-2 py-1 text-center bg-gray-200 dark:bg-gray-700 rounded border-0 focus:ring-2 focus:ring-indigo-500"
            min="1"
            max={numPages}
            title="Current page number"
            aria-label="Current page number"
            placeholder="Page"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300">/ {numPages}</span>
        </div>
        
        <button
          onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
          disabled={currentPage >= numPages}
          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title="Next page"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Watermark Component
function WatermarkOverlay() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get user email from token or API
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.email || "User");
      } catch {
        setUserEmail("User");
      }
    }
  }, []);

  const watermarkStyle = {
    backgroundImage: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 100px,
      rgba(0,0,0,0.1) 100px,
      rgba(0,0,0,0.1) 200px
    )`,
  };

  const copyrightStyle = {
    backgroundImage: `repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 150px,
      rgba(0,0,0,0.05) 150px,
      rgba(0,0,0,0.05) 300px
    )`,
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* User Watermark */}
      <div 
        className="absolute inset-0 opacity-10 text-gray-500 dark:text-gray-400"
        style={watermarkStyle}
      >
        <div className="absolute top-1/4 left-1/4 transform -rotate-45 text-sm font-semibold">
          Purchased by: {userEmail}
        </div>
        <div className="absolute top-3/4 right-1/4 transform rotate-45 text-sm font-semibold">
          Purchased by: {userEmail}
        </div>
      </div>
      
      {/* Copyright Watermark */}
      <div 
        className="absolute inset-0 opacity-5 text-gray-400 dark:text-gray-500"
        style={copyrightStyle}
      >
        <div className="absolute top-1/3 right-1/3 transform rotate-12 text-xs">
          © 2025 MyEbookPlatform. All Rights Reserved.
        </div>
        <div className="absolute bottom-1/3 left-1/3 transform -rotate-12 text-xs">
          © 2025 MyEbookPlatform. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}