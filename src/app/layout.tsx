import "./globals.css";
import Header from "../components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-text font-sans">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
