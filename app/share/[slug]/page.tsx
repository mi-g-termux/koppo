import type { Metadata } from "next";
import Link from "next/link";
import { getShareBySlug, incrementShareViews } from "@/lib/shares";
import CodeViewer from "@/components/CodeViewer";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";
import {
  Download,
  Eye,
  FileArchive,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  HardDrive,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import CopyShareLinkButton from "@/components/CopyShareLinkButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const share = await getShareBySlug(slug);

  if (!share) {
    return {
      title: "Download Not Found — MIR Labs",
      description: "The requested code snippet or download could not be found.",
    };
  }

  const title = `${share.title} — MIR Labs Code Download`;
  const description =
    share.description ||
    `Download and explore source code for ${share.title}, shared by MIR Labs.`;

  return {
    title,
    description,
    openGraph: {
      title: `📦 ${share.title}`,
      description,
      type: "article",
      locale: "en_US",
      siteName: "MIR Labs 3D Portfolio",
    },
    twitter: {
      card: "summary_large_image",
      title: `📦 ${share.title}`,
      description,
    },
  };
}

export default async function ShareDetailPage({ params }: Props) {
  const { slug } = await params;
  const share = await getShareBySlug(slug);

  // If share not found, render a friendly high-contrast fallback instead of an empty screen
  if (!share) {
    return (
      <div className="min-h-screen bg-[#060e1c] text-white flex flex-col font-sans relative z-10 selection:bg-[#00b4d8]/30">
        <ShareHeader />
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-6 shadow-xl">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0a1428] text-[#a6c5e4] border border-[#4d85b6]/30 mb-3">
            Shared Link Notice
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Download Link Not Found
          </h1>

          <p className="mt-3 text-sm text-[#a6c5e4] leading-relaxed max-w-md">
            The link for <code className="px-2 py-0.5 rounded bg-[#0a1428] text-[#00b4d8] font-mono">/share/{slug}</code> is either expired or hasn’t been published yet.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#00b4d8] text-[#060e1c] hover:bg-[#48cae4] transition-all shadow-lg shadow-[#00b4d8]/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to MIR Labs Portfolio</span>
            </Link>

            <Link
              href="https://www.instagram.com/mir.labs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#0a1428] text-[#cfe0f2] border border-[#4d85b6]/40 hover:bg-[#132742] transition-all"
            >
              <span>DM on Instagram</span>
              <ExternalLink className="w-4 h-4 text-[#7aa6d0]" />
            </Link>
          </div>
        </main>
        <ShareFooter />
      </div>
    );
  }

  // Increment view counter on server load
  await incrementShareViews(slug);

  const formattedDate = new Date(share.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const displayFileName = share.fileName || `${share.slug}.zip`;
  const displayFileSize = share.fileSize || (share.codeSnippet ? "Direct Source Code" : "ZIP Archive");

  return (
    <div className="min-h-screen bg-[#060e1c] text-white flex flex-col font-sans relative z-10 selection:bg-[#00b4d8]/30 selection:text-white">
      <ShareHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 pb-20">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6c5e4] hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-[#0a1428] border border-[#4d85b6]/30 hover:border-[#00b4d8]/50"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00b4d8]" />
            <span>Explore MIR Labs 3D Portfolio</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-[#a6c5e4] bg-[#0a1428] px-3.5 py-1.5 rounded-lg border border-[#4d85b6]/30">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>{share.views + 1} views</span>
            </span>
            <span className="text-[#4d85b6]/40">•</span>
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{share.downloads} downloads</span>
            </span>
          </div>
        </div>

        {/* HERO DOWNLOAD PORTAL CARD */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-[#0a1428] border border-[#4d85b6]/40 shadow-2xl overflow-hidden mb-8">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b4d8]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Verification Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ready for Instant Download</span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#a6c5e4]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Clean & Safe Archive</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {share.title}
          </h1>

          {/* Description */}
          {share.description && (
            <p className="mt-4 text-sm sm:text-base text-[#cfe0f2] leading-relaxed max-w-3xl">
              {share.description}
            </p>
          )}

          {/* Tags */}
          {share.tags && share.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {share.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#060e1c] text-[#a6c5e4] border border-[#4d85b6]/40"
                >
                  <Tag className="w-3 h-3 text-[#00b4d8]" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* File Metadata Specs Grid */}
          <div className="mt-6 pt-6 border-t border-[#4d85b6]/25 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#060e1c] border border-[#4d85b6]/25">
              <span className="text-[#a6c5e4] block text-[11px]">Filename</span>
              <span className="font-bold text-white font-mono truncate block mt-0.5">
                {displayFileName}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#060e1c] border border-[#4d85b6]/25">
              <span className="text-[#a6c5e4] block text-[11px]">Package Size</span>
              <span className="font-bold text-[#00b4d8] font-mono block mt-0.5">
                {displayFileSize}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#060e1c] border border-[#4d85b6]/25">
              <span className="text-[#a6c5e4] block text-[11px]">Shared On</span>
              <span className="font-bold text-white block mt-0.5">
                {formattedDate}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#060e1c] border border-[#4d85b6]/25">
              <span className="text-[#a6c5e4] block text-[11px]">Creator</span>
              <span className="font-bold text-emerald-300 block mt-0.5">
                {share.authorName || "MIR Labs"}
              </span>
            </div>
          </div>

          {/* MAIN DOWNLOAD ACTION HERO BOX */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#0c1c38] to-[#081326] border-2 border-[#00b4d8]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left w-full sm:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center shrink-0 shadow-lg shadow-[#00b4d8]/10">
                <FileArchive className="w-7 h-7 text-[#00b4d8]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Source Code & Assets Package
                </h2>
                <p className="text-xs text-[#a6c5e4] mt-0.5">
                  1-Click instant direct download • Ready for local extraction & setup
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
              {/* PRIMARY DOWNLOAD BUTTON */}
              <a
                href={`/api/share/download/${share.slug}`}
                download
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-extrabold bg-gradient-to-r from-[#00b4d8] via-[#0096c7] to-[#0077b6] text-white hover:from-[#48cae4] hover:to-[#0096c7] shadow-xl shadow-[#00b4d8]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>Download Source (.ZIP)</span>
              </a>

              {/* Alternate Cloud / Google Drive Link (if attached) */}
              {share.fileUrl && (
                <a
                  href={share.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-xs font-semibold bg-[#060e1c] text-[#cfe0f2] border border-[#4d85b6]/40 hover:bg-[#132742] hover:text-white transition-all cursor-pointer"
                  title="Open source link directly"
                >
                  <span>Open Mirror</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#7aa6d0]" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Share Footer Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#4d85b6]/20 text-xs text-[#a6c5e4]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full source code archive created & shared by <strong>{share.authorName || "MIR Labs"}</strong></span>
            </div>

            <CopyShareLinkButton slug={share.slug} title={share.title} />
          </div>
        </div>

        {/* CODE SNIPPET PREVIEW (If Code attached) */}
        {share.codeSnippet && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#00b4d8]" />
                <span>Source Code Preview</span>
              </h2>
              <span className="text-xs text-[#a6c5e4] font-mono">
                {share.language ? share.language.toUpperCase() : "TYPESCRIPT"}
              </span>
            </div>

            <CodeViewer
              code={share.codeSnippet}
              language={share.language || "typescript"}
              filename={share.fileName ? share.fileName.replace(/\.zip$/i, "") : undefined}
            />
          </div>
        )}

        {/* EXTRA CODE FILES (If multi-file snippet) */}
        {share.codeFiles &&
          share.codeFiles.map((file, idx) => (
            <div key={idx} className="mb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#00b4d8]" />
                  <span>{file.title || `File ${idx + 1}`}</span>
                </h2>
                <span className="text-xs text-[#a6c5e4] font-mono">
                  {file.language.toUpperCase()}
                </span>
              </div>
              <CodeViewer
                code={file.code}
                language={file.language}
                filename={file.title}
              />
            </div>
          ))}

        {/* ABOUT MIR LABS SOCIAL PROOF & PORTFOLIO HOOK */}
        <div className="rounded-2xl p-6 bg-[#0a1428] border border-[#4d85b6]/35 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00b4d8] to-[#0077b6] flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              MIR
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                MIR Labs — Creative Web & 3D Engineering
              </h3>
              <p className="text-xs text-[#a6c5e4] mt-0.5">
                Full-stack developer building immersive 3D portfolios, web applications, and interactive components.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00b4d8] text-[#060e1c] hover:bg-[#48cae4] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore 3D Portfolio</span>
            </Link>

            <Link
              href="https://www.instagram.com/mir.labs/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#060e1c] text-[#cfe0f2] border border-[#4d85b6]/40 hover:bg-[#132742] transition-all"
            >
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 text-[#7aa6d0]" />
            </Link>
          </div>
        </div>
      </main>

      <ShareFooter />
    </div>
  );
}
