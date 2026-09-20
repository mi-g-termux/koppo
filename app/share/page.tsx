import type { Metadata } from "next";
import Link from "next/link";
import { getAllShares } from "@/lib/shares";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";
import { Sparkles, Plus } from "lucide-react";
import ShareSearchList from "@/components/ShareSearchList";

export const metadata: Metadata = {
  title: "Code Vault & Free Downloads — MIR Labs",
  description:
    "Explore open-source snippets, 3D components, and large project templates shared by MIR Labs.",
  openGraph: {
    title: "MIR Labs — Code Vault & Downloads",
    description:
      "Explore open-source snippets, 3D components, and large project templates shared by MIR Labs.",
  },
};

export default function ShareDirectoryPage() {
  const allShares = getAllShares().filter((s) => s.isPublic);

  return (
    <div className="min-h-screen bg-ink-0 text-ice-100 flex flex-col font-sans selection:bg-ice-500/30 selection:text-white">
      <ShareHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ice-500/15 border border-ice-400/30 text-xs font-semibold text-ice-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-ice-400" />
            <span>MIR Labs Open Source & Code Vault</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Code Snippets, 3D Assets & Project Bundles
          </h1>

          <p className="mt-4 text-sm sm:text-base text-ice-300/80 leading-relaxed">
            Free, production-grade components, source code archives, and full-stack templates. Download archives directly or copy code with one click.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/share/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-ink-1/90 hover:bg-ice-500/20 text-ice-200 border border-ice-500/30 hover:border-ice-400/50 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-ice-400" />
              <span>Create / Share Code (Admin)</span>
            </Link>
          </div>
        </div>

        {/* Interactive Search & List Component */}
        <ShareSearchList initialShares={allShares} />
      </main>

      <ShareFooter />
    </div>
  );
}
