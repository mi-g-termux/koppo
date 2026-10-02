"use client";

import React, { useState } from "react";
import { Download, ExternalLink, ShieldCheck } from "lucide-react";

interface ShareDownloadActionsProps {
  slug: string;
  downloadUrl: string;
  externalMirrorUrl?: string;
}

export default function ShareDownloadActions({
  slug,
  downloadUrl,
  externalMirrorUrl,
}: ShareDownloadActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadClick = () => {
    // 1. Instantly notify the top corner badge to tick up downloads count (+1)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mir:download_clicked", { detail: { slug } })
      );
    }

    setDownloading(true);
    setDownloadSuccess(true);

    setTimeout(() => {
      setDownloading(false);
    }, 2000);

    setTimeout(() => {
      setDownloadSuccess(false);
    }, 5000);
  };

  const handleMirrorClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mir:download_clicked", { detail: { slug } })
      );
    }
  };

  return (
    <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-2.5">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
        {/* PRIMARY DOWNLOAD BUTTON */}
        <a
          href={downloadUrl}
          download
          onClick={handleDownloadClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-extrabold bg-gradient-to-r from-[#00b4d8] via-[#0096c7] to-[#0077b6] text-white hover:from-[#48cae4] hover:to-[#0096c7] shadow-xl shadow-[#00b4d8]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Download className={`w-5 h-5 ${downloading ? "animate-spin" : "animate-bounce"}`} />
          <span>
            {downloading ? "Preparing Package..." : downloadSuccess ? "Downloaded!" : "Download Source (.ZIP)"}
          </span>
        </a>

        {/* Alternate Cloud / Google Drive Link (if attached) */}
        {externalMirrorUrl && (
          <a
            href={externalMirrorUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMirrorClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-xs font-semibold bg-[#060e1c] text-[#cfe0f2] border border-[#4d85b6]/40 hover:bg-[#132742] hover:text-white transition-all cursor-pointer"
            title="Open source mirror link directly"
          >
            <span>Open Mirror</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#7aa6d0]" />
          </a>
        )}
      </div>

      {downloadSuccess && (
        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-lg animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified archive starting. Thank you for trusting MIR Labs!</span>
        </div>
      )}
    </div>
  );
}
