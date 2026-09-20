"use client";

import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";

export default function ShareHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-ink-0/80 border-b border-ice-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-ink-1/80 border border-ice-500/20 hover:border-ice-400/50 transition-all cursor-pointer shadow-sm hover:shadow-ice-500/10"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ice-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ice-400" />
            </span>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-ice-300 transition-colors">
              MIR Labs
            </span>
          </Link>
        </div>

        {/* Right Navigation & CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">

          <Link
            href="https://www.instagram.com/mir.labs/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-ice-300 bg-ink-1/60 hover:bg-ice-500/15 border border-ice-500/20 hover:border-ice-400/40 transition-all cursor-pointer"
          >
            <span>Instagram Bio</span>
            <ExternalLink className="w-3 h-3 text-ice-400" />
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-ice-500/20 via-ice-400/25 to-ice-500/20 hover:from-ice-400/30 hover:to-ice-300/30 text-ice-100 border border-ice-400/40 hover:border-ice-300 shadow-sm shadow-ice-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-ice-300 animate-pulse" />
            <span className="hidden sm:inline">Explore</span> 3D Portfolio
          </Link>
        </div>
      </div>
    </header>
  );
}
