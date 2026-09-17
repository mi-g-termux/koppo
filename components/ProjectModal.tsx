"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { useLanguage } from "@/components/LanguageProvider";
import Carousel from "@/components/Carousel";
import type { Lang } from "@/lib/i18n";

type Localised = { es: string; en: string };

export type ProjectDetail = {
  num: string;
  name: Localised;
  // Main technologies — shown both on the card and in the modal. We kept a
  // single canonical list so chips don't balloon inside the dialog.
  stack: string[];
  desc: Localised; // short card copy
  details: Localised; // longer modal copy
  url?: string;
  github?: string;
  badge?: Localised;
  // simple-icons slugs from the 3D keyboard to light up + animate when
  // this project's section is active.
  highlights?: string[];
  // Optional screenshot/preview URLs for the carousel. When missing the
  // modal falls back to stylised placeholder slides.
  media?: string[];
};

type Props = {
  project: ProjectDetail | null;
  onClose: () => void;
};

function pick<T>(loc: { es: T; en: T }, lang: Lang): T {
  return loc[lang];
}

// Fullscreen modal that details a project. Closes on ESC, click outside,
// and via the explicit close button. Stops Lenis while open (overflow:hidden
// alone isn't enough — Lenis listens to wheel events) and restores it on
// close.
export default function ProjectModal({ project, onClose }: Props) {
  const { t, lang } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = project !== null;
  const lenis = useLenis();

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Freeze the page while the modal is open: stop Lenis so wheel/touch
  // events don't leak through, plus overflow:hidden on html/body as a
  // belt-and-braces fallback.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open, lenis]);

  // Move focus into the modal when it opens so ESC captures and keyboard
  // users don't have to tab through the whole page first.
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  return (
    <div
      className={`project-modal ${open ? "project-modal--open" : ""}`}
      aria-hidden={!open}
      onClick={(e) => {
        // Click on the backdrop (not inside the dialog) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="project-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        tabIndex={-1}
        data-lenis-prevent
      >
        {project && (
          <>
            <button
              type="button"
              onClick={onClose}
              data-cursor="hover"
              className="project-modal__close"
              aria-label={t("projects.close")}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>

            <div className="project-modal__media">
              <Carousel media={project.media} projectNum={project.num} />
            </div>

            <div className="project-modal__body">
              <p className="font-mono text-xs text-ice-400 uppercase tracking-[0.25em] mb-2">
                {project.num} · {t("projects.kicker")}
              </p>
              <h3
                id="project-modal-title"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-ice-50 mb-3"
              >
                {pick(project.name, lang)}
              </h3>
              {project.badge && (
                <span className="inline-block text-[10px] uppercase tracking-widest text-ice-300 border border-ice-700 rounded-full px-2 py-0.5 mb-4">
                  {pick(project.badge, lang)}
                </span>
              )}
              <p className="text-ice-200 leading-relaxed mb-6 whitespace-pre-line">
                {pick(project.details, lang)}
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    data-magnetic
                    className="frost-btn frost-btn--primary"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M7 17L17 7M8 7h9v9" />
                    </svg>
                    {t("projects.openSite")}
                  </a>
                )}
                <a
                  href={`https://wa.me/8801322205149?text=${encodeURIComponent(
                    `Hi MIR Labs, I would like to order/build a website like "${pick(project.name, lang)}"${project.url ? ` (${project.url})` : ""}. Could you share the details, pricing and timeline?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  data-magnetic
                  className="frost-btn !bg-emerald-600/25 !border-emerald-400/40 hover:!bg-emerald-600/40 text-emerald-200 hover:text-white flex items-center gap-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>{t("projects.orderWebsite")}</span>
                </a>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    data-magnetic
                    className="frost-btn"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    {t("projects.viewCode")}
                  </a>
                )}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-ice-400 mb-2">
                  {t("projects.stackLabel")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <span key={s} className="frost-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
