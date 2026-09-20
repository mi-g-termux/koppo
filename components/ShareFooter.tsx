"use client";

import Link from "next/link";
import { Sparkles, Mail, ArrowRight } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function ShareFooter() {
  return (
    <footer className="mt-16 w-full border-t border-ice-500/15 bg-ink-0/60 backdrop-blur-md pt-12 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Call to Action Box */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-ink-1/80 to-ink-0 border border-ice-500/25 shadow-2xl overflow-hidden text-center">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-ice-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ice-500/15 border border-ice-400/30 text-xs font-semibold text-ice-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-ice-400" />
              <span>Created by MIR Labs</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Looking for High-Performance 3D & Web Apps?
            </h3>
            <p className="mt-3 text-sm sm:text-base text-ice-300/80 leading-relaxed">
              I build interactive 3D experiences, production SaaS platforms, and responsive full-stack applications. Let’s bring your next big idea to life.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-ice-400 text-ink-0 hover:bg-ice-300 hover:shadow-lg hover:shadow-ice-400/25 transition-all cursor-pointer font-sans"
              >
                <span>Explore Full 3D Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/#contact"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-ink-1/90 text-ice-100 hover:bg-ice-500/20 border border-ice-500/30 hover:border-ice-400/50 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-ice-400" />
                <span>Contact / Hire Me</span>
              </Link>

              <Link
                href="https://www.instagram.com/mir.labs/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-ice-300 hover:text-white bg-ink-1/40 hover:bg-ice-500/15 border border-ice-500/20 transition-all cursor-pointer"
              >
                <InstagramIcon className="w-4 h-4 text-ice-400" />
                <span>Instagram</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ice-400/60 gap-4">
          <p>© {new Date().getFullYear()} MIR Labs. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-ice-200 transition-colors">
              Portfolio
            </Link>
            <span>•</span>
            <Link href="https://www.instagram.com/mir.labs/" target="_blank" rel="noopener noreferrer" className="hover:text-ice-200 transition-colors">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
