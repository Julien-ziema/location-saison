import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-heading text-5xl text-blue-600">LocaFlow</h1>
        <p className="max-w-md text-lg text-slate-500">
          Automatisez vos paiements de locations saisonnières
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Commencer
        </Link>
      </div>
    </div>
  );
}
