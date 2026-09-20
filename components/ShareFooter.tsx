"use client";

import Link from "next/link";
import { Sparkles, Mail, Instagram, ArrowRight, Github, Code } from "lucide-react";

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
                <Instagram className="w-4 h-4 text-ice-400" />
                <span>Instagram</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright & Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ice-400/60 gap-4">
          <p>© {new Date().getFullYear()} MIR Labs. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-ice-200 transition-colors">
              Portfolio
            </Link>
            <span>•</span>
            <Link href="/share" className="hover:text-ice-200 transition-colors">
              Code Vault
            </Link>
            <span>•</span>
            <Link href="/share/admin" className="hover:text-ice-200 transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
