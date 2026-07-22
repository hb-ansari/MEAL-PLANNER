"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("App boundary caught error:", error);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-background font-inter space-y-6">
      <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 text-3xl">
        ⚠️
      </div>
      <h2 className="font-playfair text-3xl text-foreground font-normal">
        Something went wrong
      </h2>
      <p className="text-xs text-muted max-w-md leading-relaxed">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => reset()}
          className="border border-foreground bg-foreground text-background rounded-full px-6 py-3 text-xs uppercase tracking-widest font-medium hover:opacity-90 transition-all"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-border rounded-full px-6 py-3 text-xs uppercase tracking-widest text-foreground hover:bg-secondary transition-all"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
