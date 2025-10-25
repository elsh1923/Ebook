// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";
import BookCard from "@/components/BookCard";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
}

export default async function Home() {
  await connectDB();
  // Only fetch 8 featured books for better performance
  const dbBooks = await Book.find({})
    .select('title author price coverImageUrl')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  const books = (dbBooks as unknown[]).map((b: unknown): Book => {
    const book = b as { _id: unknown; title: string; author: string; price: number; coverImageUrl?: string };
    return {
      id: String(book._id),
      title: book.title as string,
      author: book.author as string,
      price: typeof book.price === "number" ? book.price : Number(book.price ?? 0),
      image: (book.coverImageUrl as string) || "/window.svg",
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500">

      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-28 w-96 h-96 rounded-full opacity-30 blur-3xl bg-gradient-to-tr from-violet-400 to-indigo-500 animate-slow-float"></div>
        <div className="absolute right-8 top-1/3 w-72 h-72 rounded-full opacity-20 blur-2xl bg-gradient-to-br from-cyan-400 to-blue-500 animate-tilt"></div>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-6 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-800 dark:to-cyan-700 text-indigo-700 dark:text-indigo-100 px-3 py-1 text-sm font-medium ring-1 ring-inset ring-indigo-200/30">
              New • Curated eBooks updated weekly
            </span>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white">
              Read smarter. Discover faster.
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-prose">
              Browse a growing library of expertly curated eBooks across tech, business, and creativity — elegant, fast, and available on any device.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition"
              >
                Browse Books
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-100 hover:bg-indigo-50 dark:hover:bg-indigo-800/40 transition"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-white/40 dark:bg-white/5 blur-xl" />
            <div className="relative rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/6 transform transition hover:scale-[1.01]">
              <Image
                src="/hero-image.png"
                alt="E-Library Hero Banner"
                width={720}
                height={520}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-8 md:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Instant Access", desc: "Read anywhere on any device.", icon: "⚡" },
            { title: "Quality Picks", desc: "Handpicked titles that matter.", icon: "🏆" },
            { title: "Secure Purchase", desc: "Trusted checkout process.", icon: "🔒" },
            { title: "Lifetime Library", desc: "Your books, forever.", icon: "📚" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white/60 dark:bg-slate-800/60 p-6 backdrop-blur-md border border-white/10 dark:border-white/6 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Books</h2>
            <Link href="/books" className="text-indigo-600 dark:text-cyan-300 hover:underline">View all</Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map((book: Book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-6 py-10">
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Browse by Category</h3>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {["Programming", "Design", "Marketing", "Fiction", "AI/ML", "Finance"].map((c) => (
            <Link
              key={c}
              href={`/books?category=${encodeURIComponent(c)}`}
              className="rounded-xl border bg-white/60 dark:bg-slate-800/60 px-4 py-3 text-center text-sm font-medium text-slate-900 dark:text-white hover:scale-105 transition transform"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-transparent to-transparent">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-slate-900 dark:text-white">What readers say</h3>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { q: "Fantastic curation and smooth experience.", a: "Amira" },
              { q: "I found my go-to learning library.", a: "Daniel" },
              { q: "Clean UI and fast checkout.", a: "Sophia" },
            ].map((t) => (
              <div key={t.a} className="rounded-2xl bg-white/60 dark:bg-slate-800/60 p-6 shadow-sm backdrop-blur-md border border-white/10 dark:border-white/6">
                <p className="text-slate-700 dark:text-slate-200">“{t.q}”</p>
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">— {t.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-2xl font-bold">Start your reading journey today</h4>
              <p className="mt-1 text-white/80">Join free and get access to member-only deals.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/register" className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:scale-[1.02] transition">
                Create Account
              </Link>
              <Link href="/login" className="border border-white/70 px-6 py-3 rounded-lg hover:bg-white/10 transition">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-slate-600 dark:text-slate-400">
        © {new Date().getFullYear()} — Your eBook Library
      </footer>
    </div>
  );
}
