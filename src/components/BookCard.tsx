// components/BookCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
}

export default function BookCard({ book }: { book: Book }) {
  const [imageLoading, setImageLoading] = useState(true);

  const handleBuyClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to purchase books");
      window.location.href = "/login";
      return;
    }
    
    // Navigate to payment page with book details
    const bookData = encodeURIComponent(JSON.stringify({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      image: book.image
    }));
    
    window.location.href = `/payment?book=${bookData}`;
  };

  return (
    <article className="group rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/60 border border-white/10 dark:border-white/6 shadow-lg transform transition hover:-translate-y-2">
      <div className="relative h-64">
        {imageLoading && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
        )}
        <Image
          src={book.image}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          priority={false}
        />
      </div>

      <div className="p-4">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{book.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">{book.author}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold text-indigo-600 dark:text-cyan-300">${book.price.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <Link href={`/books/${book.id}`} className="text-sm px-3 py-1 rounded-md bg-indigo-600 text-white hover:opacity-95 transition">
              Details
            </Link>
            <button 
              onClick={handleBuyClick}
              className="text-sm px-3 py-1 rounded-md bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:opacity-95 transition"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
