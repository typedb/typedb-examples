import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TypeDB + Next.js",
  description: "A minimal Next.js app on Vercel backed by TypeDB Cloud over HTTP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-2xl px-4 py-10 font-sans text-gray-900">
        <header className="mb-8">
          <Link href="/" className="text-2xl font-semibold">
            People &amp; interests
          </Link>
          <p className="text-sm text-gray-500">Deployed on Vercel backed by TypeDB.</p>
        </header>
        {children}
      </body>
    </html>
  );
}
