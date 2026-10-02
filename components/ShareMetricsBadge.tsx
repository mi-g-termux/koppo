"use client";

import React, { useState, useEffect } from "react";
import { Eye, Download, CheckCircle2 } from "lucide-react";

interface ShareMetricsBadgeProps {
  slug: string;
  initialViews: number;
  initialDownloads: number;
}

export default function ShareMetricsBadge({
  slug,
  initialViews,
  initialDownloads,
}: ShareMetricsBadgeProps) {
  const [views, setViews] = useState(initialViews);
  const [downloads, setDownloads] = useState(initialDownloads);
  const [justViewed, setJustViewed] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(false);

  // Initialize and handle instant live view increment on landing
  useEffect(() => {
    // Check if local cache has an updated view/download count for this slug
    try {
      const storedViews = localStorage.getItem(`mir_views_${slug}`);
      const storedDownloads = localStorage.getItem(`mir_downloads_${slug}`);

      if (storedViews) {
        const parsed = parseInt(storedViews, 10);
        if (!isNaN(parsed) && parsed >= initialViews) {
          setViews(parsed);
        }
      }

      if (storedDownloads) {
        const parsed = parseInt(storedDownloads, 10);
        if (!isNaN(parsed) && parsed >= initialDownloads) {
          setDownloads(parsed);
        }
      }

      // Check if this visitor's view was already counted in this browser session
      const sessionKey = `mir_session_view_${slug}`;
      const alreadyViewed = sessionStorage.getItem(sessionKey);

      if (!alreadyViewed) {
        sessionStorage.setItem(sessionKey, "1");

        // Animate view increment right in front of user within 500ms
        const timer = setTimeout(() => {
          setViews((prev) => {
            const next = prev + 1;
            try {
              localStorage.setItem(`mir_views_${slug}`, next.toString());
            } catch {}
            return next;
          });
          setJustViewed(true);
          setTimeout(() => setJustViewed(false), 2000);

          // Ping background API to record the view
          fetch("/api/share/increment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, type: "view" }),
          }).catch(() => {});
        }, 500);

        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback gracefully
    }
  }, [slug, initialViews, initialDownloads]);

  // Listen for instant download clicks from download buttons anywhere on the page
  useEffect(() => {
    const handleDownloadEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug?: string }>;
      if (!customEvent.detail || customEvent.detail.slug === slug || !customEvent.detail.slug) {
        // Immediately increment download count in real time
        setDownloads((prev) => {
          const next = prev + 1;
          try {
            localStorage.setItem(`mir_downloads_${slug}`, next.toString());
          } catch {}
          return next;
        });

        setJustDownloaded(true);
        setTimeout(() => setJustDownloaded(false), 3000);

        // Ping background API
        fetch("/api/share/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, type: "download" }),
        }).catch(() => {});
      }
    };

    window.addEventListener("mir:download_clicked", handleDownloadEvent);
    return () => {
      window.removeEventListener("mir:download_clicked", handleDownloadEvent);
    };
  }, [slug]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-3 text-xs text-[#a6c5e4] bg-[#0a1428] px-3.5 py-1.5 rounded-lg border border-[#4d85b6]/30 shadow-md">
        {/* Views Counter */}
        <span
          className={`flex items-center gap-1.5 transition-all duration-300 ${
            justViewed ? "text-[#00b4d8] font-bold scale-105" : ""
          }`}
          title="Total verified visitors"
        >
          <Eye className={`w-3.5 h-3.5 ${justViewed ? "text-[#00b4d8] animate-pulse" : "text-[#00b4d8]"}`} />
          <span className="tabular-nums font-medium">{formatNumber(views)} views</span>
          {justViewed && (
            <span className="text-[10px] font-bold text-[#00b4d8] animate-bounce ml-0.5">
              +1
            </span>
          )}
        </span>

        <span className="text-[#4d85b6]/40">•</span>

        {/* Downloads Counter */}
        <span
          className={`flex items-center gap-1.5 transition-all duration-300 ${
            justDownloaded ? "text-emerald-300 font-bold scale-105" : ""
          }`}
          title="Total verified package downloads"
        >
          <Download
            className={`w-3.5 h-3.5 ${
              justDownloaded ? "text-emerald-300 animate-bounce" : "text-emerald-400"
            }`}
          />
          <span className="tabular-nums font-medium">{formatNumber(downloads)} downloads</span>
          {justDownloaded && (
            <span className="text-[10px] font-bold text-emerald-400 animate-bounce ml-0.5">
              +1
            </span>
          )}
        </span>
      </div>

      {justDownloaded && (
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-md animate-fade-in shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Download started</span>
        </span>
      )}
    </div>
  );
}
