"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ShareItem } from "@/lib/shares";
import {
  Search,
  Code2,
  FileArchive,
  Download,
  Eye,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface ShareSearchListProps {
  initialShares: ShareItem[];
}

export default function ShareSearchList({ initialShares }: ShareSearchListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    initialShares.forEach((s) => {
      s.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [initialShares]);

  const filteredShares = useMemo(() => {
    return initialShares.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        !selectedTag || (item.tags && item.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [initialShares, searchQuery, selectedTag]);

  return (
    <div className="space-y-8">
      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-ink-1/60 p-3 rounded-2xl border border-ice-500/20 backdrop-blur-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code snippets, templates, tags (e.g. Three.js, Auth)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-0/80 border border-ice-500/20 text-xs sm:text-sm text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-400 transition-colors"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === null
                  ? "bg-ice-400 text-ink-0 font-semibold shadow-sm"
                  : "bg-ink-0/60 text-ice-300 hover:text-white border border-ice-500/20"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? "bg-ice-400 text-ink-0 font-semibold shadow-sm"
                    : "bg-ink-0/60 text-ice-300 hover:text-white border border-ice-500/20"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shares Grid */}
      {filteredShares.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-ice-500/20 bg-ink-1/30">
          <Code2 className="w-12 h-12 text-ice-400/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No shares found</h3>
          <p className="text-xs text-ice-400/70 mt-1">
            Try adjusting your search keywords or clearing tag filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredShares.map((share) => (
            <Link
              key={share.id}
              href={`/share/${share.slug}`}
              className="group relative rounded-3xl p-6 bg-gradient-to-b from-ink-1/90 to-ink-0 border border-ice-500/20 hover:border-ice-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-ice-500/10 flex flex-col justify-between"
            >
              <div>
                {/* Header Row: Type Badge & Date */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {share.fileName ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-ice-500/20 text-ice-200 border border-ice-400/30">
                        <FileArchive className="w-3.5 h-3.5 text-ice-300" />
                        <span>ZIP Package</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>{share.language || "Code"}</span>
                      </span>
                    )}

                    {share.fileSize && (
                      <span className="text-[11px] font-mono text-ice-400/80">
                        {share.fileSize}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-ice-400/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(share.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-ice-300 transition-colors line-clamp-2">
                  {share.title}
                </h3>

                {/* Description */}
                {share.description && (
                  <p className="mt-2 text-xs text-ice-300/80 line-clamp-2 leading-relaxed">
                    {share.description}
                  </p>
                )}

                {/* Tags */}
                {share.tags && share.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {share.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-ink-2 text-ice-300 border border-ice-500/10"
                      >
                        #{tag}
                      </span>
                    ))}
                    {share.tags.length > 3 && (
                      <span className="text-[10px] text-ice-400/60 self-center">
                        +{share.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-6 pt-4 border-t border-ice-500/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-ice-400/80 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {share.views}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {share.downloads}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 font-semibold text-ice-300 group-hover:text-white transition-colors">
                  <span>View & Download</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
