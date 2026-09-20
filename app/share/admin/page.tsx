"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ShareHeader from "@/components/ShareHeader";
import ShareFooter from "@/components/ShareFooter";
import {
  ShieldCheck,
  KeyRound,
  Plus,
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
  Link2,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  FolderOpen,
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

export default function ShareAdminPage() {
  const [adminPin, setAdminPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"create" | "manage" | "setup">("create");
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [r2Configured, setR2Configured] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Upload method
  const [uploadMethod, setUploadMethod] = useState<"r2" | "link" | "code_only">("r2");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedR2Data, setUploadedR2Data] = useState<{
    fileUrl: string;
    fileKey: string;
    fileName: string;
    fileSize: string;
  } | null>(null);

  // Manual link method
  const [manualFileUrl, setManualFileUrl] = useState("");
  const [manualFileName, setManualFileName] = useState("");
  const [manualFileSize, setManualFileSize] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successShareUrl, setSuccessShareUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  // Check saved session on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem("mir_admin_pin");
    if (savedPin) {
      setAdminPin(savedPin);
      validatePin(savedPin);
    }
  }, []);

  const validatePin = async (pinToTest: string) => {
    setAuthError("");
    try {
      const res = await fetch("/api/share", {
        headers: { "x-admin-key": pinToTest },
      });
      const data = await res.json();
      if (res.status === 401 || !data.success) {
        setAuthError("Incorrect Admin PIN. Please check your .env ADMIN_SECRET_KEY.");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        sessionStorage.setItem("mir_admin_pin", pinToTest);
        setShares(data.shares || []);
        setR2Configured(Boolean(data.r2Configured));
      }
    } catch (err) {
      setAuthError("Failed to connect to API server.");
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
        setShares(data.shares || []);
        setR2Configured(Boolean(data.r2Configured));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingShares(false);
    }
  };

  // Auto-slugify when title changes
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

  // Helper to format byte sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Handle direct file upload to Cloudflare R2
  const handleR2FileUpload = async (file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);

    try {
      // Step 1: Request presigned URL from backend
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
        alert("R2 Upload Error: " + (presignedData.error || "Failed to get upload URL"));
        setUploadProgress(null);
        return;
      }

      const { uploadUrl, downloadUrl, key } = presignedData;

      // Step 2: Upload directly from browser to Cloudflare R2 via XMLHttpRequest with progress
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
          alert(`Upload failed with status code ${xhr.status}`);
          setUploadProgress(null);
        }
      };

      xhr.onerror = () => {
        alert("Upload failed due to network or CORS error.");
        setUploadProgress(null);
      };

      xhr.send(file);
    } catch (err: any) {
      alert("Error: " + err.message);
      setUploadProgress(null);
    }
  };

  // Submit and create share record
  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title");
      return;
    }

    setSubmitting(true);
    setSuccessShareUrl(null);

    let finalFileUrl = "";
    let finalFileName = "";
    let finalFileSize = "";
    let finalFileKey = "";

    if (uploadMethod === "r2" && uploadedR2Data) {
      finalFileUrl = uploadedR2Data.fileUrl;
      finalFileName = uploadedR2Data.fileName;
      finalFileSize = uploadedR2Data.fileSize;
      finalFileKey = uploadedR2Data.fileKey;
    } else if (uploadMethod === "link") {
      finalFileUrl = manualFileUrl;
      finalFileName = manualFileName || "source-code.zip";
      finalFileSize = manualFileSize || "";
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
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          isPublic,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Error: " + data.error);
      } else {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        setSuccessShareUrl(fullUrl);
        // Reset form
        setTitle("");
        setSlug("");
        setDescription("");
        setCodeSnippet("");
        setTags("");
        setSelectedFile(null);
        setUploadedR2Data(null);
        setUploadProgress(null);
        setManualFileUrl("");
        setManualFileName("");
        setManualFileSize("");
        fetchShares();
      }
    } catch (err: any) {
      alert("Failed to create share: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Share
  const handleDeleteShare = async (shareSlug: string) => {
    if (!confirm(`Are you sure you want to delete "${shareSlug}"?`)) return;

    try {
      const res = await fetch(`/api/share/${shareSlug}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminPin },
      });
      const data = await res.json();
      if (data.success) {
        setShares(shares.filter((s) => s.slug !== shareSlug && s.id !== shareSlug));
      } else {
        alert("Error deleting: " + data.error);
      }
    } catch (err: any) {
      alert("Failed to delete share");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  // Lock Screen Render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink-0 text-ice-100 flex flex-col font-sans">
        <ShareHeader />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full rounded-3xl p-8 bg-gradient-to-b from-ink-1 to-ink-0 border border-ice-500/25 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-ice-500/15 border border-ice-400/40 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-ice-300" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              Admin Code & File Vault
            </h2>
            <p className="mt-2 text-xs text-ice-300/80">
              Enter your Admin Secret PIN to create and manage shareable links.
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
                  placeholder="Enter Admin PIN (Default: mirlabs2026)"
                  className="w-full px-4 py-3 rounded-xl bg-ink-0 border border-ice-500/30 text-center font-mono text-sm text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-300 transition-colors"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-ice-400 text-ink-0 font-bold text-sm hover:bg-ice-300 hover:shadow-lg hover:shadow-ice-400/20 transition-all cursor-pointer font-sans"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
        <ShareFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-0 text-ice-100 flex flex-col font-sans">
      <ShareHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Top Title & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-ice-500/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Share Admin Dashboard
              </h1>
            </div>
            <p className="text-xs text-ice-300/80 mt-1">
              Create branded links for Instagram bio, stories, and client handoffs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-ink-1/80 p-1.5 rounded-2xl border border-ice-500/20">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-ice-400 text-ink-0 shadow-sm"
                  : "text-ice-300 hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Share</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("manage");
                fetchShares();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "manage"
                  ? "bg-ice-400 text-ink-0 shadow-sm"
                  : "text-ice-300 hover:text-white"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Manage ({shares.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("setup")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "setup"
                  ? "bg-ice-400 text-ink-0 shadow-sm"
                  : "text-ice-300 hover:text-white"
              }`}
            >
              <CloudflareIcon className="w-3.5 h-3.5" />
              <span>R2 Storage</span>
              {r2Configured ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: CREATE NEW SHARE */}
        {activeTab === "create" && (
          <div className="space-y-8">
            {/* Success URL Banner */}
            {successShareUrl && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-ink-1 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <Check className="w-5 h-5" />
                    <span>Share Link Generated Successfully!</span>
                  </div>
                  <p className="text-xs text-ice-200 mt-1 font-mono break-all">
                    {successShareUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(successShareUrl)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
                  >
                    {copyStatus ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copyStatus ? "Copied!" : "Copy for Instagram"}</span>
                  </button>

                  <Link
                    href={successShareUrl}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-ink-0 text-ice-200 hover:text-white border border-ice-500/30 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateShare} className="space-y-8">
              {/* Card 1: Share Basic Info */}
              <div className="rounded-3xl p-6 sm:p-8 bg-ink-1/60 border border-ice-500/20 space-y-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ice-400" />
                  <span>1. Share Details</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-ice-200 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="e.g. Next.js 15 Auth Starter Pack"
                      className="w-full px-4 py-2.5 rounded-xl bg-ink-0 border border-ice-500/20 text-sm text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ice-200 mb-2">
                      Custom URL Slug *
                    </label>
                    <div className="flex items-center rounded-xl bg-ink-0 border border-ice-500/20 overflow-hidden focus-within:border-ice-400">
                      <span className="px-3 text-xs text-ice-400/60 font-mono select-none">
                        /share/
                      </span>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                        placeholder="nextjs-auth-starter"
                        className="w-full pr-4 py-2.5 bg-transparent text-sm font-mono text-ice-100 placeholder:text-ice-400/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ice-200 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of what this code or bundle does..."
                    className="w-full px-4 py-2.5 rounded-xl bg-ink-0 border border-ice-500/20 text-sm text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-ice-200 mb-2">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Three.js, React, Tailwind, JWT"
                      className="w-full px-4 py-2.5 rounded-xl bg-ink-0 border border-ice-500/20 text-sm text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-400"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="isPublicCheck"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded text-ice-500 focus:ring-ice-400 bg-ink-0 border-ice-500/30"
                    />
                    <label htmlFor="isPublicCheck" className="text-xs text-ice-200 cursor-pointer">
                      Show in public Code Vault directory (<code className="font-mono text-ice-400">/share</code>)
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Large File / ZIP Attachment */}
              <div className="rounded-3xl p-6 sm:p-8 bg-ink-1/60 border border-ice-500/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-ice-400" />
                    <span>2. Large File / .ZIP Attachment (Optional)</span>
                  </h2>

                  <div className="flex items-center gap-1.5 bg-ink-0 p-1 rounded-xl border border-ice-500/20">
                    <button
                      type="button"
                      onClick={() => setUploadMethod("r2")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        uploadMethod === "r2"
                          ? "bg-ice-500/20 text-ice-200 border border-ice-400/40"
                          : "text-ice-400 hover:text-ice-200"
                      }`}
                    >
                      Cloudflare R2 Direct Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod("link")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        uploadMethod === "link"
                          ? "bg-ice-500/20 text-ice-200 border border-ice-400/40"
                          : "text-ice-400 hover:text-ice-200"
                      }`}
                    >
                      External Link (Google Drive / GitHub)
                    </button>
                  </div>
                </div>

                {uploadMethod === "r2" ? (
                  <div className="space-y-4">
                    {!r2Configured && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Cloudflare R2 keys not detected in .env yet.</strong>
                          <p className="mt-0.5 text-amber-300/80">
                            You can still paste code snippets or use Google Drive links, or configure your free R2 bucket in the &quot;R2 Storage&quot; tab!
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      className="border-2 border-dashed border-ice-500/30 hover:border-ice-400/60 rounded-2xl p-8 text-center bg-ink-0/60 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("r2FileInput")?.click()}
                    >
                      <input
                        type="file"
                        id="r2FileInput"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleR2FileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <UploadCloud className="w-10 h-10 text-ice-400 mx-auto mb-3 animate-bounce" />
                      <p className="text-sm font-semibold text-white">
                        {selectedFile ? selectedFile.name : "Click or Drag & Drop large .zip / archive file"}
                      </p>
                      <p className="text-xs text-ice-400/70 mt-1">
                        Uploads directly to Cloudflare R2 • Supports up to 5GB per file • 0 egress cost
                      </p>
                    </div>

                    {uploadProgress !== null && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-ice-300">
                          <span>Uploading directly to Cloudflare R2...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-ink-0 overflow-hidden border border-ice-500/20">
                          <div
                            className="h-full bg-gradient-to-r from-ice-500 to-ice-300 transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        {uploadedR2Data && (
                          <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                            <Check className="w-3.5 h-3.5" />
                            <span>Uploaded ({uploadedR2Data.fileSize})</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-ice-200 mb-2">
                        File Download URL (Google Drive / GitHub Releases / Dropbox)
                      </label>
                      <input
                        type="url"
                        value={manualFileUrl}
                        onChange={(e) => setManualFileUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... or GitHub release link"
                        className="w-full px-4 py-2.5 rounded-xl bg-ink-0 border border-ice-500/20 text-xs sm:text-sm text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-400"
                      />
                      <p className="text-[11px] text-ice-400/60 mt-1">
                        Google Drive links are automatically converted to direct 1-click download links.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ice-200 mb-2">
                        Display File Size (e.g. 45 MB)
                      </label>
                      <input
                        type="text"
                        value={manualFileSize}
                        onChange={(e) => setManualFileSize(e.target.value)}
                        placeholder="45 MB"
                        className="w-full px-4 py-2.5 rounded-xl bg-ink-0 border border-ice-500/20 text-xs sm:text-sm text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Code Snippet */}
              <div className="rounded-3xl p-6 sm:p-8 bg-ink-1/60 border border-ice-500/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-ice-400" />
                    <span>3. Paste Source Code Snippet (Optional)</span>
                  </h2>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-ice-300 font-medium">Language:</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-ink-0 border border-ice-500/20 text-xs text-ice-100 focus:outline-none focus:border-ice-400 cursor-pointer"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={12}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="// Paste your component, script, or configuration code here..."
                    className="w-full p-4 rounded-2xl bg-ink-0 border border-ice-500/20 font-mono text-xs text-ice-100 placeholder:text-ice-400/40 focus:outline-none focus:border-ice-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-ice-400 text-ink-0 hover:bg-ice-300 hover:shadow-xl hover:shadow-ice-400/25 transition-all cursor-pointer disabled:opacity-50 font-sans"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? "Publishing Share..." : "Generate Share Link"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: MANAGE ACTIVE SHARES */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Active Share Links</h2>
              <button
                onClick={fetchShares}
                disabled={loadingShares}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-ice-300 bg-ink-1 hover:bg-ice-500/15 border border-ice-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingShares ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {shares.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-ice-500/20 bg-ink-1/30">
                <FolderOpen className="w-12 h-12 text-ice-400/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">No shares created yet</h3>
                <p className="text-xs text-ice-400/70 mt-1">
                  Click &quot;New Share&quot; to upload your first zip file or code snippet!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {shares.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-ink-1/60 border border-ice-500/20 hover:border-ice-400/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white truncate max-w-md">
                          {item.title}
                        </span>
                        {item.fileName && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-ice-500/20 text-ice-200 border border-ice-400/30">
                            ZIP ({item.fileSize || "File"})
                          </span>
                        )}
                        {!item.isPublic && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Unlisted
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-ice-400/80 font-mono">
                        <span>/share/{item.slug}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-ice-400" />
                          {item.views} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-ice-400" />
                          {item.downloads} downloads
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/share/${item.slug}`;
                          copyToClipboard(url);
                        }}
                        title="Copy Share Link"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-ice-500/15 text-ice-200 hover:bg-ice-500/25 border border-ice-500/30 transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-ice-400" />
                        <span>Copy Link</span>
                      </button>

                      <Link
                        href={`/share/${item.slug}`}
                        target="_blank"
                        title="View Public Page"
                        className="p-2 rounded-xl bg-ink-0 text-ice-300 hover:text-white border border-ice-500/20 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeleteShare(item.slug)}
                        title="Delete Share"
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLOUDFLARE R2 SETUP GUIDE */}
        {activeTab === "setup" && (
          <div className="rounded-3xl p-6 sm:p-8 bg-ink-1/60 border border-ice-500/20 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-ice-500/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <CloudflareIcon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Cloudflare R2 Free Storage Setup
                  </h2>
                  <p className="text-xs text-ice-400/80">
                    10 GB Free Storage • $0 Egress/Bandwidth Fees • Fast Global Direct Downloads
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  r2Configured
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                {r2Configured ? "R2 Configured & Active" : "R2 Not Configured"}
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-ice-200/90 leading-relaxed">
              <p>
                To enable direct drag-and-drop uploads for massive 100MB–1GB+ zip archives with 0 bandwidth costs, follow these 4 quick steps:
              </p>

              <ol className="list-decimal pl-5 space-y-3 text-ice-300">
                <li>
                  Go to the{" "}
                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-ice-300 underline hover:text-white"
                  >
                    Cloudflare Dashboard
                  </a>{" "}
                  $\rightarrow$ select <strong>R2</strong> in the sidebar.
                </li>
                <li>
                  Click <strong>&quot;Create bucket&quot;</strong> (e.g. name it <code className="text-ice-200">mir-labs-shares</code>).
                </li>
                <li>
                  Click <strong>&quot;Manage R2 API Tokens&quot;</strong> $\rightarrow$ <strong>&quot;Create API Token&quot;</strong> with <em>Admin Read & Write</em> permissions.
                </li>
                <li>
                  Copy the credentials and paste them into your project&apos;s <code className="text-ice-200">.env</code> file:
                </li>
              </ol>

              {/* Code Snippet for .env */}
              <div className="p-4 rounded-2xl bg-ink-0 border border-ice-500/20 font-mono text-xs text-ice-100 overflow-x-auto">
                <pre>{`# Cloudflare R2 Free Storage (10 GB Free, $0 Egress)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=mir-labs-shares
# (Optional: Public custom domain or r2.dev domain for bucket)
R2_PUBLIC_URL=https://pub-yourbucket.r2.dev`}</pre>
              </div>

              <div className="p-4 rounded-2xl bg-ice-500/10 border border-ice-500/20 text-xs text-ice-300">
                💡 <strong>Tip:</strong> Even without Cloudflare R2, you can immediately paste code snippets and use direct Google Drive or GitHub Releases links in the <strong>New Share</strong> tab!
              </div>
            </div>
          </div>
        )}
      </main>

      <ShareFooter />
    </div>
  );
}

function CloudflareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
    </svg>
  );
}
