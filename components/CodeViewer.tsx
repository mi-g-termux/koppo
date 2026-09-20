"use client";

import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-sql";
import { Check, Copy, Code2, Maximize2, Minimize2, FileCode } from "lucide-react";

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeViewer({
  code,
  language = "typescript",
  filename,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const lineCount = code.split("\n").length;
  const langNormalized = (language || "typescript").toLowerCase().trim();

  return (
    <div
      className={`relative rounded-2xl border border-ice-500/20 bg-ink-0/90 backdrop-blur-xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
        isFullscreen
          ? "fixed inset-4 z-50 max-h-[calc(100vh-2rem)] border-ice-400/40 shadow-ice-500/20"
          : "w-full"
      }`}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ice-500/15 bg-ink-1/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60 border border-red-500/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/60 border border-amber-500/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/60 border border-emerald-500/40 inline-block" />
          </div>

          <div className="h-4 w-px bg-ice-500/20 mx-1" />

          <div className="flex items-center gap-2 truncate">
            <FileCode className="w-4 h-4 text-ice-400 shrink-0" />
            <span className="text-xs font-mono font-medium text-ice-200 truncate">
              {filename || `snippet.${langNormalized === "typescript" ? "ts" : langNormalized === "python" ? "py" : langNormalized}`}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold rounded-full bg-ice-500/10 text-ice-300 border border-ice-500/20">
              {langNormalized}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[11px] font-mono text-ice-400/60">
            {lineCount} lines
          </span>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="p-1.5 rounded-lg text-ice-400 hover:text-ice-100 hover:bg-ice-500/15 transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              copied
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                : "bg-ice-500/15 text-ice-200 hover:bg-ice-500/25 hover:text-white border border-ice-500/30"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-ice-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="relative overflow-x-auto overflow-y-auto max-h-[600px] flex text-sm font-mono leading-relaxed p-4 bg-[#050b16]">
        {/* Line Numbers */}
        <div
          aria-hidden="true"
          className="select-none pr-4 text-right text-ice-500/40 font-mono text-xs border-r border-ice-500/10 shrink-0"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Content */}
        <pre className="pl-4 flex-1 m-0 overflow-visible bg-transparent font-mono text-xs sm:text-sm text-ice-100 leading-6 whitespace-pre">
          <code className={`language-${langNormalized}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
