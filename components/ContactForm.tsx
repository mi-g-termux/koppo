"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in all fields.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="w-full rounded-2xl bg-ink-1/75 backdrop-blur-md border border-ink-3 p-6 sm:p-7 shadow-2xl pointer-events-auto">
      {status === "success" ? (
        <div className="py-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ice-400/20 text-ice-300 border border-ice-400/40">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-ice-50">Message Sent!</h3>
          <p className="text-sm text-ice-200 max-w-sm mx-auto leading-relaxed">
            Thank you for reaching out. We have received your message and will get back to you shortly.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="frost-btn !py-2 !px-4 !text-xs mt-2"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-ice-300 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mahfuj Islam"
                className="w-full px-3.5 py-2.5 rounded-xl bg-ink-2/60 border border-ink-3 text-ice-50 placeholder:text-ice-400/40 text-sm focus:outline-none focus:border-ice-400 focus:ring-1 focus:ring-ice-400/40 transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-ice-300 mb-1.5">
                Your Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-ink-2/60 border border-ink-3 text-ice-50 placeholder:text-ice-400/40 text-sm focus:outline-none focus:border-ice-400 focus:ring-1 focus:ring-ice-400/40 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wider text-ice-300 mb-1.5">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell me about your project or inquiry..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-ink-2/60 border border-ink-3 text-ice-50 placeholder:text-ice-400/40 text-sm focus:outline-none focus:border-ice-400 focus:ring-1 focus:ring-ice-400/40 transition resize-none"
            />
          </div>

          {status === "error" && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg p-2.5">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              disabled={status === "loading"}
              data-cursor="hover"
              data-magnetic
              className="frost-btn frost-btn--primary !px-5 !py-2.5 flex items-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
            <span className="text-[11px] text-ice-400 font-mono">
              Direct inbox delivery
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
