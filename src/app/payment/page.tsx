"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const bookParam = searchParams.get("book");
    if (!bookParam) {
      router.push("/books");
      return;
    }

    try {
      const bookData = JSON.parse(decodeURIComponent(bookParam));
      setBook(bookData);
    } catch (err) {
      console.error("Error parsing book data:", err);
      router.push("/books");
    } finally {
      setLoading(false);
    }
  }, [searchParams, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token || !book) return;

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the buy API
      const response = await fetch("/api/users/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: JSON.parse(atob(token.split(".")[1])).userId,
          bookId: book.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 3000);
      } else {
        setError(data.error || "Payment failed. Please try again.");
      }
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Book not found</h2>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            You have successfully purchased &quot;{book.title}&quot;. Redirecting to your dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow">
                EB
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-xl">E-Library</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete Your Purchase</h1>
            <p className="text-slate-600 dark:text-slate-300">Secure payment for your digital book</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Book Summary */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="relative w-24 h-32 rounded-lg overflow-hidden">
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{book.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-2">by {book.author}</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-cyan-300">${book.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>${book.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/10 dark:border-white/6 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Payment Details</h2>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-4">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-lg border transition ${
                        paymentMethod === "card"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-sm font-medium">Card</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-3 rounded-lg border transition ${
                        paymentMethod === "paypal"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.543-.676c-.608-.685-1.46-1.033-2.53-1.033H9.95c-.524 0-.968.382-1.05.9L7.76 19.637h4.716c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c.524 0 .968-.382 1.05-.9l1.12-7.106z"/>
                        </svg>
                        <span className="text-sm font-medium">PayPal</span>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <>
                    {/* Card Number */}
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Card Holder Name */}
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === "paypal" && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:scale-[1.02] transform transition font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pay ${book.price.toFixed(2)}
                    </>
                  )}
                </button>
              </form>

              {/* Back to Books */}
              <div className="mt-6 text-center">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-white/60 dark:from-slate-900 dark:to-slate-900 transition-colors duration-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
