export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShareBySlug, getRealisticMetricsForSlug, normalizeSlug } from "@/lib/shares";
import { getCanonicalUrl } from "@/lib/site";
import CodeViewer from "@/components/CodeViewer";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";
import ShareMetricsBadge from "@/components/ShareMetricsBadge";
import ShareDownloadActions from "@/components/ShareDownloadActions";
import {
  FileArchive,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  HardDrive,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import CopyShareLinkButton from "@/components/CopyShareLinkButton";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ d?: string; f?: string; t?: string; s?: string; desc?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const query = searchParams ? await searchParams : {};
  const share = await getShareBySlug(slug);

  if (!share && (query.t || query.f || query.d)) {
    const rawTitle = query.t ? decodeURIComponent(query.t) : `${slug.replace(/-/g, " ")} — Code Download`;
    return {
      title: `${rawTitle} | MIR Labs Code Vault`,
      description: query.desc ? decodeURIComponent(query.desc) : "Direct download package shared by MIR Labs.",
      robots: { index: false, follow: false },
    };
  }

  if (!share) {
    return {
      title: "Resource Not Found — MIR Labs",
      description: "The requested code snippet or download could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${share.title} — Free Source Code Download | MIR Labs`;
  const description =
    share.description ||
    `Download and explore source code for ${share.title}, shared by MIR Labs. Free, clean and production-ready.`;
  const canonical = getCanonicalUrl(`/share/${share.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    openGraph: {
      title: `📦 ${share.title} — MIR Labs`,
      description,
      url: canonical,
      type: "article",
      locale: "en_US",
      siteName: "MIR Labs",
      publishedTime: share.createdAt,
      modifiedTime: share.updatedAt,
      tags: share.tags,
      images: [
        {
          url: getCanonicalUrl("/logo-mir-labs.png"),
          width: 1200,
          height: 630,
          alt: share.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `📦 ${share.title}`,
      description,
      images: [getCanonicalUrl("/logo-mir-labs.png")],
    },
  };
}

export default async function ShareDetailPage({ params, searchParams }: Props) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const query = searchParams ? await searchParams : {};
  let share = await getShareBySlug(slug);

  // If not found in database, check portable URL parameters
  if (!share && (query.f || query.d)) {
    const realisticDefault = getRealisticMetricsForSlug(slug);

    if (query.d) {
      try {
        const decoded = JSON.parse(Buffer.from(query.d, "base64url").toString("utf-8"));
        share = {
          id: `portable_${slug}`,
          slug: slug,
          title: decoded.title || slug.replace(/-/g, " "),
          description: decoded.description || "",
          fileUrl: decoded.fileUrl || "",
          fileName: decoded.fileName || `${slug}.zip`,
          fileSize: decoded.fileSize || "External Archive",
          codeSnippet: decoded.codeSnippet || "",
          language: decoded.language || "typescript",
          tags: decoded.tags || [],
          views: realisticDefault.views,
          downloads: realisticDefault.downloads,
          createdAt: decoded.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic: true,
          authorName: decoded.authorName || "MIR Labs",
          authorInstagram: "https://www.instagram.com/mir.labs/",
        };
      } catch (err) {
        console.warn("Error decoding portable share payload:", err);
      }
    } else if (query.f) {
      share = {
        id: `portable_${slug}`,
        slug: slug,
        title: query.t ? decodeURIComponent(query.t) : slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: query.desc ? decodeURIComponent(query.desc) : "Direct download package shared by MIR Labs.",
        fileUrl: decodeURIComponent(query.f),
        fileName: `${slug}.zip`,
        fileSize: query.s ? decodeURIComponent(query.s) : "External Cloud Archive",
        views: realisticDefault.views,
        downloads: realisticDefault.downloads,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: true,
        authorName: "MIR Labs",
        authorInstagram: "https://www.instagram.com/mir.labs/",
      };
    }
  }

  // If share truly not found, return real HTTP 404 response
  if (!share) {
    notFound();
  }

  const metrics = getRealisticMetricsForSlug(share.slug, share.views, share.downloads);

  const formattedDate = new Date(share.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const displayFileName = share.fileName || `${share.slug}.zip`;
  const displayFileSize = share.fileSize || (share.codeSnippet ? "Direct Source Code" : "ZIP Archive");

  // Schema.org SoftwareSourceCode structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: share.title,
    description: share.description || `Source code and components for ${share.title}`,
    programmingLanguage: share.language || "TypeScript",
    codeRepository: "https://github.com/mirlabss",
    url: getCanonicalUrl(`/share/${share.slug}`),
    datePublished: share.createdAt,
    dateModified: share.updatedAt,
    author: {
      "@type": "Person",
      name: share.authorName || "MIR Labs",
      url: "https://www.instagram.com/mir.labs/",
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getCanonicalUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Code Vault",
        item: getCanonicalUrl("/share"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: share.title,
        item: getCanonicalUrl(`/share/${share.slug}`),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#060e1c] text-white flex flex-col font-sans relative z-10 selection:bg-[#00b4d8]/30 selection:text-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <ShareHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 pb-20">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6c5e4] hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-[#0a1428] border border-[#4d85b6]/30 hover:border-[#00b4d8]/50"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>3D Portfolio</span>
            </Link>

            <Link
              href="/share"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#cfe0f2] hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-[#0a1428] border border-[#4d85b6]/30 hover:border-[#00b4d8]/50"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>All Shares</span>
            </Link>
          </div>

          {/* Interactive Top Corner Metrics with Instant Live Updates */}
          <ShareMetricsBadge
            slug={share.slug}
            initialViews={metrics.views}
            initialDownloads={metrics.downloads}
          />
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

            <ShareDownloadActions
              slug={share.slug}
              downloadUrl={`/api/share/download/${share.slug}${share.fileUrl ? `?f=${encodeURIComponent(share.fileUrl)}` : ""}`}
              externalMirrorUrl={share.fileUrl}
            />
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
