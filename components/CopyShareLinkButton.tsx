"use client";

import React, { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface CopyShareLinkButtonProps {
  slug: string;
  title: string;
}

export default function CopyShareLinkButton({ slug, title }: CopyShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `/share/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out "${title}" on MIR Labs Code Vault`,
          url,
        });
        return;
      } catch {
        // Fallback to copy if user cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
        copied
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
          : "bg-[#0a1428] text-[#cfe0f2] hover:text-white hover:bg-[#132742] border border-[#4d85b6]/40"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-ice-400" />
          <span>Share Link</span>
        </>
      )}
    </button>
  );
}
