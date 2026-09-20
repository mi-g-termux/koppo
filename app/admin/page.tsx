"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";
import {
  KeyRound,
  FileArchive,
  Code2,
  UploadCloud,
  Check,
  Copy,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Link as LinkIcon,
  Pencil,
  X,
  AlertCircle,
} from "lucide-react";
import { ShareItem } from "@/lib/shares";

const LANGUAGES = [
  { label: "TypeScript (.ts)", value: "typescript" },
  { label: "React / TSX (.tsx)", value: "tsx" },
  { label: "JavaScript (.js)", value: "javascript" },
  { label: "React / JSX (.jsx)", value: "jsx" },
  { label: "Python (.py)", value: "python" },
  { label: "HTML (.html)", value: "html" },
  { label: "CSS / SCSS (.css)", value: "css" },
  { label: "JSON (.json)", value: "json" },
  { label: "Rust (.rs)", value: "rust" },
  { label: "Go (.go)", value: "go" },
  { label: "SQL (.sql)", value: "sql" },
  { label: "Bash / Shell (.sh)", value: "bash" },
];

const DEMO_SLUGS = ["fly-to-cart", "threejs-keyboard-3d", "nextjs-fullstack-starter"];
const DEMO_IDS = ["share_fly_to_cart", "share_threejs_keyboard", "share_auth_starter"];

function isDemoShare(share: ShareItem): boolean {
  if (DEMO_IDS.includes(share.id)) return true;
  if (DEMO_SLUGS.includes(share.slug) && (!share.fileUrl || share.fileUrl.trim() === "")) {
    return true;
  }
  return false;
}

export default function AdminPage() {
  const [adminPin, setAdminPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [shares, setShares] = useState<ShareItem[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [r2Configured, setR2Configured] = useState(false);
  const [databaseConfigured, setDatabaseConfigured] = useState(false);

  // Form fields for creating a new share
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tags, setTags] = useState("");

  // External link (Google Drive, Dropbox, GitHub releases)
  const [externalFileUrl, setExternalFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");

  // Direct R2 upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedR2Data, setUploadedR2Data] = useState<{
    fileUrl: string;
    fileKey: string;
    fileName: string;
    fileSize: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successShareUrl, setSuccessShareUrl] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  // Edit Modal State
  const [editingShare, setEditingShare] = useState<ShareItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFileUrl, setEditFileUrl] = useState("");
  const [editFileName, setEditFileName] = useState("");
  const [editFileSize, setEditFileSize] = useState("");
  const [editLanguage, setEditLanguage] = useState("typescript");
  const [editCodeSnippet, setEditCodeSnippet] = useState("");
  const [editTags, setEditTags] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Unify merge and synchronization
  const syncAndMergeShares = async (serverShares: ShareItem[], currentPin: string) => {
    let localCustom: ShareItem[] = [];
    let deletedSlugs: string[] = [];

    try {
      if (typeof window !== "undefined") {
        localCustom = JSON.parse(localStorage.getItem("mir_custom_shares") || "[]");
        deletedSlugs = JSON.parse(localStorage.getItem("mir_deleted_slugs") || "[]");
      }
    } catch (e) {
      console.warn("Could not read local storage shares:", e);
    }

    // Scrub any legacy demo shares from local storage
    localCustom = localCustom.filter((s) => !isDemoShare(s) && !deletedSlugs.includes(s.slug));
    if (typeof window !== "undefined") {
      localStorage.setItem("mir_custom_shares", JSON.stringify(localCustom));
    }

    // Filter server shares: purge demo shares and deleted slugs
    const filteredServer = (serverShares || []).filter(
      (s) => !isDemoShare(s) && !deletedSlugs.includes(s.slug)
    );

    // Combine: localCustom take precedence
    const map = new Map<string, ShareItem>();
    for (const s of filteredServer) {
      map.set(s.slug, s);
    }
    for (const c of localCustom) {
      map.set(c.slug, c);
    }

    const merged = Array.from(map.values());
    setShares(merged);

    // Background sync: push any missing shares to server so public links work permanently
    const missingOnServer = localCustom.filter((c) => !filteredServer.some((s) => s.slug === c.slug));
    if (missingOnServer.length > 0 && currentPin) {
      for (const item of missingOnServer) {
        try {
          await fetch("/api/share", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": currentPin,
            },
            body: JSON.stringify(item),
          });
        } catch (err) {
          console.warn("Failed to sync local share to server:", err);
        }
      }
    }
  };

  // On mount, check if password was stored in session
  useEffect(() => {
    const savedPin = sessionStorage.getItem("mir_admin_pin");
    if (savedPin) {
      setAdminPin(savedPin);
      validatePin(savedPin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validatePin = async (pinToTest: string) => {
    if (!pinToTest || !pinToTest.trim()) {
      setAuthError("Please enter your admin password.");
      setIsAuthenticated(false);
      return;
    }
    setAuthError("");
    try {
      const res = await fetch("/api/share", {
        headers: { "x-admin-key": pinToTest.trim() },
      });
      const data = await res.json();
      if (!res.ok || res.status === 401 || !data.success) {
        setAuthError("Incorrect admin password.");
        setIsAuthenticated(false);
        sessionStorage.removeItem("mir_admin_pin");
      } else {
        setIsAuthenticated(true);
        sessionStorage.setItem("mir_admin_pin", pinToTest.trim());
        setR2Configured(Boolean(data.r2Configured));
        setDatabaseConfigured(Boolean(data.databaseConfigured));
        await syncAndMergeShares(data.shares || [], pinToTest.trim());
      }
    } catch {
      setAuthError("Failed to connect to API server.");
      setIsAuthenticated(false);
    }
  };

  const fetchShares = async () => {
    setLoadingShares(true);
    try {
      const res = await fetch("/api/share", {
        headers: { "x-admin-key": adminPin },
      });
      const data = await res.json();
      if (data.success) {
        setR2Configured(Boolean(data.r2Configured));
        setDatabaseConfigured(Boolean(data.databaseConfigured));
        await syncAndMergeShares(data.shares || [], adminPin);
      }
    } catch (err: unknown) {
      console.error("Error fetching shares:", err);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Direct Cloudflare R2 Upload
  const handleR2FileUpload = async (file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);

    try {
      const presignedRes = await fetch("/api/share/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPin,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      const presignedData = await presignedRes.json();
      if (!presignedData.success) {
        alert(
          "Cloudflare R2 Note: " +
            (presignedData.error ||
              "To use direct upload, set Cloudflare R2 keys in Vercel. Otherwise, use Google Drive link!")
        );
        setUploadProgress(null);
        return;
      }

      const { uploadUrl, downloadUrl, key } = presignedData;

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadedR2Data({
            fileUrl: downloadUrl,
            fileKey: key,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
          });
          setUploadProgress(100);
        } else {
          alert(`Upload failed (Status ${xhr.status})`);
          setUploadProgress(null);
        }
      };

      xhr.onerror = () => {
        alert("Upload error. If you haven't configured R2, use Google Drive link instead!");
        setUploadProgress(null);
      };

      xhr.send(file);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      alert("Error: " + msg);
      setUploadProgress(null);
    }
  };

  // Submit and Create Share
  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSubmitting(true);
    setSuccessShareUrl(null);

    let finalFileUrl = externalFileUrl.trim();
    let finalFileName = fileName.trim();
    let finalFileSize = fileSize.trim();
    let finalFileKey = "";

    if (uploadedR2Data) {
      finalFileUrl = uploadedR2Data.fileUrl;
      finalFileName = uploadedR2Data.fileName;
      finalFileSize = uploadedR2Data.fileSize;
      finalFileKey = uploadedR2Data.fileKey;
    } else if (!finalFileName && finalFileUrl) {
      finalFileName = `${slug || "project"}.zip`;
    }

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPin,
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          language,
          codeSnippet,
          fileUrl: finalFileUrl,
          fileName: finalFileName,
          fileSize: finalFileSize,
          fileKey: finalFileKey,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          isPublic: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Error: " + data.error);
      } else {
        let fullUrl = `${window.location.origin}${data.shareUrl}`;
        if (finalFileUrl && !databaseConfigured) {
          fullUrl += `?f=${encodeURIComponent(finalFileUrl)}&t=${encodeURIComponent(title)}`;
          if (finalFileSize) fullUrl += `&s=${encodeURIComponent(finalFileSize)}`;
        }
        setSuccessShareUrl(fullUrl);

        // Store new share locally so it ALWAYS shows in admin panel
        if (data.share) {
          const createdShare: ShareItem = {
            ...data.share,
            fileUrl: finalFileUrl,
            fileName: finalFileName,
            fileSize: finalFileSize,
          };
          if (typeof window !== "undefined") {
            const localCustom: ShareItem[] = JSON.parse(
              localStorage.getItem("mir_custom_shares") || "[]"
            );
            const updated = [
              createdShare,
              ...localCustom.filter((s) => s.slug !== createdShare.slug && !isDemoShare(s)),
            ];
            localStorage.setItem("mir_custom_shares", JSON.stringify(updated));

            const deletedSlugs: string[] = JSON.parse(
              localStorage.getItem("mir_deleted_slugs") || "[]"
            ).filter((s: string) => s !== createdShare.slug);
            localStorage.setItem("mir_deleted_slugs", JSON.stringify(deletedSlugs));
          }
          setShares((prev) => [
            createdShare,
            ...prev.filter((s) => s.slug !== createdShare.slug && !isDemoShare(s)),
          ]);
        }

        // Reset form
        setTitle("");
        setSlug("");
        setDescription("");
        setCodeSnippet("");
        setTags("");
        setExternalFileUrl("");
        setFileName("");
        setFileSize("");
        setSelectedFile(null);
        setUploadedR2Data(null);
        setUploadProgress(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create share";
      alert("Error: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: ShareItem) => {
    setEditingShare(item);
    setEditTitle(item.title || "");
    setEditSlug(item.slug || "");
    setEditDescription(item.description || "");
    setEditFileUrl(item.fileUrl || "");
    setEditFileName(item.fileName || "");
    setEditFileSize(item.fileSize || "");
    setEditLanguage(item.language || "typescript");
    setEditCodeSnippet(item.codeSnippet || "");
    setEditTags(item.tags ? item.tags.join(", ") : "");
    setEditError("");
  };

  // Save Edit Changes
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShare) return;
    if (!editTitle.trim()) {
      setEditError("Title is required.");
      return;
    }
    setIsSavingEdit(true);
    setEditError("");

    try {
      const res = await fetch(`/api/share/${editingShare.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPin,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: editSlug.trim(),
          description: editDescription.trim(),
          fileUrl: editFileUrl.trim(),
          fileName: editFileName.trim(),
          fileSize: editFileSize.trim(),
          language: editLanguage,
          codeSnippet: editCodeSnippet,
          tags: editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEditError(data.error || "Failed to update share.");
        setIsSavingEdit(false);
        return;
      }

      const updatedShare: ShareItem = data.share || {
        ...editingShare,
        title: editTitle.trim(),
        slug: editSlug.trim() || editingShare.slug,
        description: editDescription.trim(),
        fileUrl: editFileUrl.trim(),
        fileName: editFileName.trim(),
        fileSize: editFileSize.trim(),
        language: editLanguage,
        codeSnippet: editCodeSnippet,
        tags: editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        updatedAt: new Date().toISOString(),
      };

      // Update state
      setShares((prev) =>
        prev.map((s) => (s.slug === editingShare.slug || s.id === editingShare.id ? updatedShare : s))
      );

      // Update localStorage
      if (typeof window !== "undefined") {
        const localCustom: ShareItem[] = JSON.parse(
          localStorage.getItem("mir_custom_shares") || "[]"
        );
        const updatedLocal = localCustom.map((s) =>
          s.slug === editingShare.slug || s.id === editingShare.id ? updatedShare : s
        );
        if (!updatedLocal.some((s) => s.slug === updatedShare.slug)) {
          updatedLocal.unshift(updatedShare);
        }
        localStorage.setItem("mir_custom_shares", JSON.stringify(updatedLocal));
      }

      setEditingShare(null);
      alert("Share updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setEditError(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteShare = async (shareSlug: string) => {
    if (!confirm(`Are you sure you want to delete "/share/${shareSlug}"?`)) return;

    // Immediately remove from UI
    setShares((prev) => prev.filter((s) => s.slug !== shareSlug && s.id !== shareSlug));

    // Persist deletion locally so it NEVER reappears
    if (typeof window !== "undefined") {
      const deletedSlugs: string[] = JSON.parse(
        localStorage.getItem("mir_deleted_slugs") || "[]"
      );
      if (!deletedSlugs.includes(shareSlug)) {
        deletedSlugs.push(shareSlug);
        localStorage.setItem("mir_deleted_slugs", JSON.stringify(deletedSlugs));
      }

      const localCustom: ShareItem[] = JSON.parse(
        localStorage.getItem("mir_custom_shares") || "[]"
      );
      const filtered = localCustom.filter(
        (s) => s.slug !== shareSlug && s.id !== shareSlug
      );
      localStorage.setItem("mir_custom_shares", JSON.stringify(filtered));
    }

    try {
      await fetch(`/api/share/${shareSlug}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminPin },
      });
    } catch {
      // Handled gracefully
    }
  };

  const copyToClipboard = (text: string, targetKey: string = "general") => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(targetKey);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  // 🔒 Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060e1c] text-white flex flex-col font-sans relative z-10">
        <ShareHeader />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full rounded-3xl p-8 bg-[#0a1428] border border-[#4d85b6]/30 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#4d85b6]/20 border border-[#7aa6d0]/40 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-[#cfe0f2]" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              MIR Labs Admin Portal
            </h2>
            <p className="mt-2 text-xs text-[#a6c5e4]">
              Enter your Admin Secret Password to manage your files and download links.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                validatePin(adminPin);
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter your secret admin password"
                  className="w-full px-4 py-3 rounded-xl bg-[#050b16] border border-[#4d85b6]/40 text-center font-mono text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7aa6d0] transition-colors"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-300">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#7aa6d0] hover:bg-[#a6c5e4] text-[#050b16] font-bold text-sm shadow-lg transition-all cursor-pointer"
              >
                Unlock Admin Dashboard
              </button>
            </form>
          </div>
        </div>
        <ShareFooter />
      </div>
    );
  }

  // 🚀 Authenticated Dashboard
  return (
    <div className="min-h-screen bg-[#060e1c] text-white flex flex-col font-sans relative z-10">
      <ShareHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#4d85b6]/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                MIR Labs — Code & File Link Creator
              </h1>
            </div>
            <p className="text-xs text-[#a6c5e4] mt-1">
              Create, view, and edit direct download links to send to users or Instagram followers.
            </p>
          </div>

          <button
            onClick={fetchShares}
            disabled={loadingShares}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0a1428] hover:bg-[#131f3a] text-[#cfe0f2] border border-[#4d85b6]/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingShares ? "animate-spin" : ""}`} />
            <span>Refresh ({shares.length} active links)</span>
          </button>
        </div>

        {/* Storage Mode Status Notice */}
        <div className="mb-6 p-4 rounded-2xl bg-[#0a1428] border border-[#4d85b6]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${databaseConfigured ? "bg-emerald-400 animate-pulse" : "bg-[#00b4d8]"}`} />
            <span className="font-bold text-white">
              {databaseConfigured
                ? "Persistent Database Active (Cloudflare R2 / Vercel KV)"
                : "Active Storage Engine (Direct Links + Portable URLs)"}
            </span>
          </div>
          <span className="text-[#a6c5e4]">
            {databaseConfigured
              ? "All created links are permanently stored and accessible via clean short URLs."
              : "All created links are saved locally and synced to server. Google Drive links work 100% worldwide!"}
          </span>
        </div>

        {/* Success Banner */}
        {successShareUrl && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 to-[#0a1428] border border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <Check className="w-5 h-5" />
                <span>Link Generated! Send this to your user:</span>
              </div>
              <p className="text-xs text-white mt-1 font-mono break-all font-semibold">
                {successShareUrl}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyToClipboard(successShareUrl, "banner")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all cursor-pointer shadow-lg"
              >
                {copiedTarget === "banner" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTarget === "banner" ? "Copied!" : "Copy Link for Users"}</span>
              </button>

              <Link
                href={successShareUrl}
                target="_blank"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#050b16] text-white hover:bg-[#131f3a] border border-[#4d85b6]/30 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link</span>
              </Link>
            </div>
          </div>
        )}

        {/* Creator Form */}
        <form onSubmit={handleCreateShare} className="space-y-8">
          {/* Card 1: Details */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0a1428] border border-[#4d85b6]/30 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7aa6d0]" />
              <span>1. Project / Code Title & Custom Link</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#cfe0f2] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Next.js 15 Full-Stack Template"
                  className="w-full px-4 py-3 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7aa6d0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cfe0f2] mb-2">
                  Custom URL Slug *
                </label>
                <div className="flex items-center rounded-xl bg-[#050b16] border border-[#4d85b6]/30 overflow-hidden focus-within:border-[#7aa6d0]">
                  <span className="px-3 text-xs text-gray-400 font-mono select-none">
                    /share/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="nextjs-fullstack-template"
                    className="w-full pr-4 py-3 bg-transparent text-sm font-mono text-white placeholder:text-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cfe0f2] mb-2">
                Short Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this code do? (e.g. Complete source code with authentication, database, and TailwindCSS)"
                className="w-full px-4 py-3 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7aa6d0]"
              />
            </div>
          </div>

          {/* Card 2: Large File Download Attachment */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0a1428] border border-[#4d85b6]/30 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-[#7aa6d0]" />
              <span>2. File Download Attachment (Google Drive, Dropbox, or Direct Upload)</span>
            </h2>

            {/* External Link Input */}
            <div className="p-5 rounded-2xl bg-[#050b16] border border-[#4d85b6]/40 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#7aa6d0]">
                <LinkIcon className="w-4 h-4" />
                <span>Option A: Paste Google Drive / Dropbox / Cloud Download Link (Recommended)</span>
              </div>
              <p className="text-xs text-[#a6c5e4]">
                Upload your large `.zip` or project files to Google Drive or Dropbox, copy the share link, and paste it here. Your admin dashboard will store this exact link so you never lose it, and users get a clean 1-click download button!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="url"
                    value={externalFileUrl}
                    onChange={(e) => setExternalFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or Dropbox link"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a1428] border border-[#4d85b6]/30 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7aa6d0]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="File Size (e.g. 45 MB)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a1428] border border-[#4d85b6]/30 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7aa6d0]"
                  />
                </div>
              </div>
            </div>

            {/* Direct Upload (Cloudflare R2) */}
            <div className="p-5 rounded-2xl bg-[#050b16] border border-[#4d85b6]/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-[#7aa6d0]">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  <span>Option B: Direct Upload via Free Cloudflare R2</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${r2Configured ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border-amber-500/30"}`}>
                  {r2Configured ? "R2 Active" : "R2 Not Setup (Use Option A)"}
                </span>
              </div>
              <p className="text-xs text-[#a6c5e4]">
                Upload files up to 5GB directly from your browser with zero bandwidth costs (Requires Cloudflare R2 keys in Vercel).
              </p>

              <div
                className="border-2 border-dashed border-[#4d85b6]/40 hover:border-[#7aa6d0] rounded-xl p-6 text-center bg-[#0a1428] cursor-pointer transition-colors"
                onClick={() => document.getElementById("r2FileSelect")?.click()}
              >
                <input
                  type="file"
                  id="r2FileSelect"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleR2FileUpload(e.target.files[0]);
                    }
                  }}
                />
                <UploadCloud className="w-8 h-8 text-[#7aa6d0] mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium text-white">
                  {selectedFile ? selectedFile.name : "Click to select a file from your computer"}
                </p>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono text-[#cfe0f2]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-400"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Code Snippet */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0a1428] border border-[#4d85b6]/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#7aa6d0]" />
                <span>3. Code Snippet Preview (Optional)</span>
              </h2>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-xs text-white focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              rows={8}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// Paste your component, script, or configuration code here (if you want the user to preview or download single files)..."
              className="w-full p-4 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 font-mono text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7aa6d0]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-[#7aa6d0] hover:bg-[#a6c5e4] text-[#050b16] shadow-xl hover:shadow-[#7aa6d0]/25 transition-all cursor-pointer font-sans"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Generating Link..." : "Generate Shareable Link"}</span>
            </button>
          </div>
        </form>

        {/* Existing Active Links Section */}
        <div className="mt-16 pt-8 border-t border-[#4d85b6]/20 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#7aa6d0]" />
              <span>Your Added Files & Links ({shares.length})</span>
            </h2>
            <span className="text-xs text-[#a6c5e4]">
              {shares.length === 0 ? "No active links" : "Only showing files you added"}
            </span>
          </div>

          {shares.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-[#4d85b6]/30 bg-[#0a1428]/50 space-y-2">
              <FolderOpen className="w-10 h-10 text-[#4d85b6]/50 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No files or links added yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Use the form above to add your first project or code download link. It will appear here permanently with direct file URLs and 1-click copy buttons.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {shares.map((item) => (
                <div
                  key={item.id || item.slug}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0a1428] border border-[#4d85b6]/30 shadow-lg hover:border-[#7aa6d0]/40 transition-all space-y-4"
                >
                  {/* Top Row: Title, Badges, Metrics & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#4d85b6]/20">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-white">{item.title}</span>
                        {item.fileSize && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#4d85b6]/20 text-[#cfe0f2] border border-[#4d85b6]/30">
                            {item.fileSize}
                          </span>
                        )}
                        {item.language && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#050b16] text-[#7aa6d0] border border-[#4d85b6]/30">
                            {item.language.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono mt-1.5">
                        <span className="text-[#a6c5e4]">/share/{item.slug}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-[#7aa6d0]" />
                          {item.views} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          {item.downloads} downloads
                        </span>
                        {item.createdAt && (
                          <>
                            <span>•</span>
                            <span className="text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#7aa6d0]/15 text-[#cfe0f2] hover:bg-[#7aa6d0]/25 border border-[#7aa6d0]/40 transition-all cursor-pointer"
                        title="Edit this share details & file link"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#7aa6d0]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteShare(item.slug)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                        title="Delete Share Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Middle Row 1: Direct File Download Link (Google Drive / Direct URL) */}
                  <div className="p-3.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                      <FileArchive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-[#a6c5e4] flex items-center gap-2">
                          <span>Target Download File:</span>
                          {item.fileName && (
                            <span className="text-gray-400 font-mono">({item.fileName})</span>
                          )}
                        </div>
                        {item.fileUrl ? (
                          <p
                            className="text-xs text-emerald-300 font-mono truncate mt-0.5"
                            title={item.fileUrl}
                          >
                            {item.fileUrl}
                          </p>
                        ) : item.codeSnippet ? (
                          <p className="text-xs text-[#a6c5e4] italic mt-0.5">
                            Direct code snippet provided (downloadable as {item.language || "text"} file)
                          </p>
                        ) : (
                          <p className="text-xs text-amber-400/80 italic mt-0.5">
                            No file URL attached yet (click Edit to attach Google Drive / direct link)
                          </p>
                        )}
                      </div>
                    </div>

                    {item.fileUrl && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.fileUrl!, `file_${item.slug}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0a1428] text-[#cfe0f2] hover:bg-[#131f3a] border border-[#4d85b6]/30 transition-all cursor-pointer"
                          title="Copy the direct Google Drive/cloud link"
                        >
                          {copiedTarget === `file_${item.slug}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#7aa6d0]" />
                              <span>Copy Direct File Link</span>
                            </>
                          )}
                        </button>

                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#0a1428] text-gray-300 hover:text-white border border-[#4d85b6]/30 transition-all"
                          title="Open direct file link in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Middle Row 2: Public Share Page URL */}
                  <div className="p-3.5 rounded-xl bg-[#071120] border border-[#00b4d8]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                      <LinkIcon className="w-4 h-4 text-[#00b4d8] shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-semibold text-[#a6c5e4]">
                          Public Link for Users (Instagram / DM):
                        </span>
                        <p className="text-xs text-[#00b4d8] font-mono font-semibold truncate mt-0.5">
                          {typeof window !== "undefined" ? window.location.origin : ""}/share/{item.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          let url = `${window.location.origin}/share/${item.slug}`;
                          if (item.fileUrl && !databaseConfigured) {
                            url += `?f=${encodeURIComponent(item.fileUrl)}&t=${encodeURIComponent(item.title)}`;
                            if (item.fileSize) url += `&s=${encodeURIComponent(item.fileSize)}`;
                          }
                          copyToClipboard(url, `share_${item.slug}`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00b4d8]/20 text-[#00b4d8] hover:bg-[#00b4d8]/30 border border-[#00b4d8]/40 transition-all cursor-pointer"
                      >
                        {copiedTarget === `share_${item.slug}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link for Users</span>
                          </>
                        )}
                      </button>

                      <a
                        href={
                          item.fileUrl && !databaseConfigured
                            ? `/share/${item.slug}?f=${encodeURIComponent(item.fileUrl)}&t=${encodeURIComponent(item.title)}${item.fileSize ? `&s=${encodeURIComponent(item.fileSize)}` : ""}`
                            : `/share/${item.slug}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#050b16] text-gray-300 hover:text-white border border-[#4d85b6]/30 transition-all"
                        title="Test Public Download Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ✏️ EDIT MODAL */}
      {editingShare && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full my-8 bg-[#0a1428] border border-[#4d85b6]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#4d85b6]/20">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#7aa6d0]" />
                <h2 className="text-lg font-bold text-white">Edit Share: {editingShare.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingShare(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#050b16] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                  Project / Code Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white focus:outline-none focus:border-[#7aa6d0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                  Custom URL Slug * (/share/...)
                </label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) =>
                    setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm font-mono text-white focus:outline-none focus:border-[#7aa6d0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                  Direct File Download Link (Google Drive / Dropbox / Direct URL)
                </label>
                <input
                  type="url"
                  value={editFileUrl}
                  onChange={(e) => setEditFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white font-mono focus:outline-none focus:border-[#7aa6d0]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  You can change this link anytime. The direct file will always be displayed on your dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={editFileName}
                    onChange={(e) => setEditFileName(e.target.value)}
                    placeholder="project-source.zip"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white focus:outline-none focus:border-[#7aa6d0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={editFileSize}
                    onChange={(e) => setEditFileSize(e.target.value)}
                    placeholder="e.g. 24.5 MB"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white focus:outline-none focus:border-[#7aa6d0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white focus:outline-none focus:border-[#7aa6d0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                    Language (if code attached)
                  </label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-xs text-white focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="React, Animation, Next.js"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 text-sm text-white focus:outline-none focus:border-[#7aa6d0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cfe0f2] mb-1.5">
                  Code Snippet (Optional)
                </label>
                <textarea
                  rows={5}
                  value={editCodeSnippet}
                  onChange={(e) => setEditCodeSnippet(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#050b16] border border-[#4d85b6]/30 font-mono text-xs text-white focus:outline-none focus:border-[#7aa6d0]"
                />
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#4d85b6]/20">
                <button
                  type="button"
                  onClick={() => setEditingShare(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#050b16] text-gray-300 hover:text-white border border-[#4d85b6]/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#7aa6d0] hover:bg-[#a6c5e4] text-[#050b16] shadow-lg transition-all cursor-pointer"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ShareFooter />
    </div>
  );
}
