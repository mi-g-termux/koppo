import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getShareBySlug, incrementShareViews } from "@/lib/shares";
import CodeViewer from "@/components/CodeViewer";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";
import {
  Download,
  Calendar,
  Eye,
  FileArchive,
  ArrowLeft,
  Tag,
} from "lucide-react";
import CopyShareLinkButton from "@/components/CopyShareLinkButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const share = getShareBySlug(slug);

  if (!share) {
    return {
      title: "Code Share Not Found — MIR Labs",
      description: "The requested code snippet or download could not be found.",
    };
  }

  const title = `${share.title} — MIR Labs Code Vault`;
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
  const share = getShareBySlug(slug);

  if (!share) {
    notFound();
  }

  // Increment view counter on server load
  incrementShareViews(slug);

  const formattedDate = new Date(share.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-ink-0 text-ice-100 flex flex-col font-sans selection:bg-ice-500/30 selection:text-white">
      <ShareHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/share"
            className="inline-flex items-center gap-2 text-xs font-medium text-ice-400 hover:text-ice-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Code Vault</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-ice-400/80">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-ice-400" />
              <span>{share.views + 1} views</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-ice-400" />
              <span>{share.downloads} downloads</span>
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-ink-1/90 via-ink-0 to-ink-1/60 border border-ice-500/20 shadow-xl overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-ice-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Tags */}
          {share.tags && share.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {share.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-ice-500/10 text-ice-300 border border-ice-500/20"
                >
                  <Tag className="w-3 h-3 text-ice-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug sm:leading-tight">
            {share.title}
          </h1>

          {share.description && (
            <p className="mt-4 text-sm sm:text-base text-ice-200/80 leading-relaxed max-w-3xl">
              {share.description}
            </p>
          )}

          {/* Creator & Meta bar */}
          <div className="mt-6 pt-5 border-t border-ice-500/15 flex flex-wrap items-center justify-between gap-4 text-xs text-ice-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Shared by <strong className="text-white">{share.authorName || "MIR Labs"}</strong>
              </span>
              <span className="text-ice-500/40">•</span>
              <span className="flex items-center gap-1 text-ice-400">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>

            {/* Quick Share Buttons */}
            <CopyShareLinkButton slug={share.slug} title={share.title} />
          </div>
        </div>

        {/* Large File / ZIP Download Card (if attached) */}
        {(share.fileUrl || share.fileName) && (
          <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-ink-1/90 to-ink-2/80 border border-ice-400/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-ice-500/20 border border-ice-400/40 flex items-center justify-center shrink-0">
                <FileArchive className="w-6 h-6 text-ice-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-mono truncate max-w-xs sm:max-w-md">
                    {share.fileName || `${share.slug}.zip`}
                  </h3>
                  {share.fileSize && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-ice-500/20 text-ice-200 border border-ice-400/30">
                      {share.fileSize}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ice-400/80 mt-1">
                  Full source archive ready for 1-click extraction & local setup
                </p>
              </div>
            </div>

            <a
              href={`/api/share/download/${share.slug}`}
              download
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-ice-400 text-ink-0 hover:bg-ice-300 hover:shadow-lg hover:shadow-ice-400/25 transition-all cursor-pointer font-sans shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Source (.ZIP)</span>
            </a>
          </div>
        )}

        {/* Code Snippet Viewer (if attached) */}
        {share.codeSnippet && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-semibold text-ice-200 uppercase tracking-wider flex items-center gap-2">
                <span>Source Code Preview</span>
              </h2>
            </div>
            <CodeViewer
              code={share.codeSnippet}
              language={share.language || "typescript"}
              filename={share.fileName ? share.fileName.replace(/\.zip$/i, "") : undefined}
            />
          </div>
        )}

        {/* Extra Code Files (if multi-file snippet) */}
        {share.codeFiles &&
          share.codeFiles.map((file, idx) => (
            <div key={idx} className="mb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold text-ice-200 uppercase tracking-wider">
                  {file.title || `File ${idx + 1}`}
                </h2>
              </div>
              <CodeViewer
                code={file.code}
                language={file.language}
                filename={file.title}
              />
            </div>
          ))}
      </main>

      <ShareFooter />
    </div>
  );
}
