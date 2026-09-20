import Link from "next/link";
import { ArrowLeft, ExternalLink, HelpCircle } from "lucide-react";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060e1c] text-white flex flex-col font-sans relative z-10 selection:bg-[#00b4d8]/30">
      <ShareHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#4d85b6]/20 border border-[#7aa6d0]/40 flex items-center justify-center mb-6 shadow-lg shadow-[#00b4d8]/10">
          <HelpCircle className="w-8 h-8 text-[#cfe0f2]" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4d85b6]/20 text-[#cfe0f2] border border-[#7aa6d0]/30 mb-4">
          404 — Link Not Found
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Resource or Download Not Found
        </h1>

        <p className="mt-3 text-sm sm:text-base text-[#a6c5e4] max-w-lg leading-relaxed">
          The link you followed may have expired, been updated, or mistyped.
          If you received this link via Instagram DM or bio, contact @mir.labs for an updated link.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#00b4d8] text-[#060e1c] hover:bg-[#48cae4] transition-all shadow-lg shadow-[#00b4d8]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore MIR Labs 3D Portfolio</span>
          </Link>

          <Link
            href="https://www.instagram.com/mir.labs/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#0a1428] text-[#cfe0f2] border border-[#4d85b6]/40 hover:bg-[#132742] transition-all"
          >
            <span>Instagram @mir.labs</span>
            <ExternalLink className="w-4 h-4 text-[#7aa6d0]" />
          </Link>
        </div>
      </main>

      <ShareFooter />
    </div>
  );
}
