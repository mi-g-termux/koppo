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

export default function AdminPage() {
  const [adminPin, setAdminPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [shares, setShares] = useState<ShareItem[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [r2Configured, setR2Configured] = useState(false);

  // Form fields
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
  const [copiedLink, setCopiedLink] = useState(false);

  // On mount, check if password was stored in session
  useEffect(() => {
    const savedPin = sessionStorage.getItem("mir_admin_pin");
    if (savedPin) {
      setAdminPin(savedPin);
      validatePin(savedPin);
    }
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
        setShares(data.shares || []);
        setR2Configured(Boolean(data.r2Configured));
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
        setShares(data.shares || []);
        setR2Configured(Boolean(data.r2Configured));
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
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          isPublic: true,
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
        setExternalFileUrl("");
        setFileName("");
        setFileSize("");
        setSelectedFile(null);
        setUploadedR2Data(null);
        setUploadProgress(null);
        fetchShares();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create share";
      alert("Error: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShare = async (shareSlug: string) => {
    if (!confirm(`Delete share "/share/${shareSlug}"?`)) return;

    try {
      const res = await fetch(`/api/share/${shareSlug}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminPin },
      });
      const data = await res.json();
      if (data.success) {
        setShares(shares.filter((s) => s.slug !== shareSlug && s.id !== shareSlug));
      } else {
        alert("Error: " + data.error);
      }
    } catch {
      alert("Failed to delete share");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
              Enter your Admin Secret Password to create and manage your shareable code links.
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#4d85b6]/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                MIR Labs — Code & File Link Creator
              </h1>
            </div>
            <p className="text-xs text-[#a6c5e4] mt-1">
              Create direct links to send to your Instagram followers or clients.
            </p>
          </div>

          <button
            onClick={fetchShares}
            disabled={loadingShares}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0a1428] hover:bg-[#131f3a] text-[#cfe0f2] border border-[#4d85b6]/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingShares ? "animate-spin" : ""}`} />
            <span>Refresh ({shares.length} links)</span>
          </button>
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
                onClick={() => copyToClipboard(successShareUrl)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all cursor-pointer shadow-lg"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied!" : "Copy Link for Instagram"}</span>
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
              <span>2. File Download Attachment (ZIP / Archive / Google Drive)</span>
            </h2>

            {/* External Link Input (Easiest, works with 500MB+ files) */}
            <div className="p-5 rounded-2xl bg-[#050b16] border border-[#4d85b6]/40 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#7aa6d0]">
                <LinkIcon className="w-4 h-4" />
                <span>Option A: Paste Google Drive / Dropbox / GitHub Download Link (Recommended for Large Files)</span>
              </div>
              <p className="text-xs text-[#a6c5e4]">
                Upload your large `.zip` file to your Google Drive, copy the share link, and paste it here. Your website will automatically give your visitor a direct 1-click download button under your domain!
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#7aa6d0]" />
            <span>Your Generated Links ({shares.length})</span>
          </h2>

          {shares.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-[#4d85b6]/30 bg-[#0a1428]/50">
              <p className="text-xs text-gray-400">No links created yet. Use the form above to generate your first link!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shares.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0a1428] border border-[#4d85b6]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.title}</span>
                      {item.fileSize && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#4d85b6]/20 text-[#cfe0f2]">
                          {item.fileSize}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-mono mt-1">
                      <span>/share/{item.slug}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#7aa6d0]" />
                        {item.views} views
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-[#7aa6d0]" />
                        {item.downloads} downloads
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/share/${item.slug}`;
                        copyToClipboard(url);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#4d85b6]/20 text-[#cfe0f2] hover:bg-[#4d85b6]/30 border border-[#4d85b6]/40 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>

                    <Link
                      href={`/share/${item.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-[#050b16] text-gray-300 hover:text-white border border-[#4d85b6]/30 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteShare(item.slug)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ShareFooter />
    </div>
  );
}
