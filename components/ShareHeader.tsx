"use client";

import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";

export default function ShareHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#060e1c]/90 border-b border-[#4d85b6]/25 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0a1428] border border-[#4d85b6]/30 hover:border-[#00b4d8]/60 transition-all cursor-pointer shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00b4d8]" />
            </span>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#cfe0f2] transition-colors">
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
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#cfe0f2] bg-[#0a1428] hover:bg-[#132742] border border-[#4d85b6]/30 hover:border-[#7aa6d0]/50 transition-all cursor-pointer"
          >
            <span>Instagram Bio</span>
            <ExternalLink className="w-3 h-3 text-[#7aa6d0]" />
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00b4d8]/20 via-[#48cae4]/20 to-[#00b4d8]/20 hover:from-[#00b4d8]/30 hover:to-[#48cae4]/30 text-white border border-[#00b4d8]/50 shadow-sm shadow-[#00b4d8]/10 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#48cae4] animate-pulse" />
            <span className="hidden sm:inline">Explore</span> 3D Portfolio
          </Link>
        </div>
      </div>
    </header>
  );
}
