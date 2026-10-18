export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { getAllShares } from "@/lib/shares";
import { getCanonicalUrl } from "@/lib/site";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";
import ShareSearchList from "@/components/ShareSearchList";
import { ArrowLeft, Sparkles, FolderGit2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Code Vault & Free Source Code Downloads — MIR Labs",
  description:
    "Explore, inspect, and download production-ready React components, micro-animations, and full-stack modules created and shared by MIR Labs.",
  alternates: {
    canonical: getCanonicalUrl("/share"),
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
  },
  openGraph: {
    title: "MIR Labs Code Vault & Free Downloads",
    description:
      "Explore, inspect, and download production-ready React components, micro-animations, and full-stack modules by MIR Labs.",
    url: getCanonicalUrl("/share"),
    type: "website",
    locale: "en_US",
    siteName: "MIR Labs",
    images: [
      {
        url: getCanonicalUrl("/logo-mir-labs.png"),
        width: 1200,
        height: 630,
        alt: "MIR Labs Code Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIR Labs Code Vault & Free Downloads",
    description:
      "Explore, inspect, and download production-ready React components, micro-animations, and full-stack modules by MIR Labs.",
    images: [getCanonicalUrl("/logo-mir-labs.png")],
  },
};

export default async function ShareDirectoryPage() {
  const shares = await getAllShares();
  const publicShares = shares.filter((s) => s.isPublic !== false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "MIR Labs Code Vault & Downloads",
    description:
      "Free open-source code packages, interactive React components, and design assets by MIR Labs.",
    url: getCanonicalUrl("/share"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: publicShares.map((share, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: getCanonicalUrl(`/share/${share.slug}`),
        name: share.title,
        description: share.description || `Source code package for ${share.title}`,
      })),
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
    ],
  };

  return (
    <div className="min-h-screen bg-[#060e1c] text-white flex flex-col font-sans relative z-10 selection:bg-[#00b4d8]/30 selection:text-white">
      {/* Schema.org Structured Data */}
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
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#a6c5e4] hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-[#0a1428] border border-[#4d85b6]/30 hover:border-[#00b4d8]/50"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00b4d8]" />
            <span>Back to 3D Portfolio</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#0a1428] to-[#07101f] border border-[#4d85b6]/35 shadow-2xl overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00b4d8]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#00b4d8]/15 text-[#48cae4] border border-[#00b4d8]/30 mb-3">
              <FolderGit2 className="w-3.5 h-3.5 text-[#00b4d8]" />
              <span>Public Component Repository</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              MIR Labs Code Vault
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#a6c5e4] max-w-2xl leading-relaxed">
              Curated collection of interactive UI components, micro-animations, and full-stack modules.
              Explore, inspect the source, or grab the zip packages for your own projects.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#cfe0f2]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{publicShares.length} Verified Components Available</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00b4d8]" />
                <span>100% Free &amp; Open Source</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Listing UI */}
        <ShareSearchList initialShares={publicShares} />
      </main>

      <ShareFooter />
    </div>
  );
}
