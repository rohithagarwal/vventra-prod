import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] pt-32 pb-16 flex flex-col items-center justify-center container">
        <div className="max-w-3xl text-center space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--role)]">
            A Venture Intelligence Company
          </span>
          <h1 className="display xl">
            Curated opportunities, <em>structured for serious capital</em>.
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto leading-relaxed">
            Every opportunity is verified, documentation-reviewed, and structured to vvEntra&apos;s standard. Browse freely. Unlock only what earns your attention.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link href="/login" className="nav-auth-btn text-base px-8 py-3">
              Open Login & Registration Portal ➔
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
