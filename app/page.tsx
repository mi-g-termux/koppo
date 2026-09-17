"use client";

import { useState } from "react";
import FrozenKeyboard from "@/components/FrozenKeyboard";
import SmoothScroll from "@/components/smooth-scroll";
import Reveal from "@/components/Reveal";
import SectionNav from "@/components/SectionNav";
import CopyEmail from "@/components/CopyEmail";
import ContactForm from "@/components/ContactForm";
import SeasonPicker from "@/components/SeasonPicker";
import ProjectModal, {
  type ProjectDetail,
} from "@/components/ProjectModal";
import { useLanguage } from "@/components/LanguageProvider";
import { useIsMobile } from "@/lib/useIsMobile";
import { SKILLS_FLAT } from "@/lib/skills";
import type { Lang } from "@/lib/i18n";
import {
  Bot,
  Globe,
  Layers,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  ExternalLink,
  Shield,
  Briefcase,
} from "lucide-react";

const EMAIL = "mirlabs11@gmail.com";
const GITHUB = "https://github.com/mirlabss";
const INSTAGRAM = "https://www.instagram.com/mir.labs/";
const LINKEDIN = "https://www.linkedin.com/in/mir-labs-346860437/";
const WHATSAPP = "https://wa.me/8801322205149";

type Localised = { es: string; en: string };

type Project = ProjectDetail & {
  align: "left" | "right";
  section: "project1" | "project2" | "project3" | "project4";
};

const projects: Project[] = [
  {
    num: "01",
    name: { es: "Fruitopia", en: "Fruitopia" },
    stack: [
      "React",
      "Node.js",
      "MongoDB",
      "Payments",
      "Courier API",
      "Admin dashboard",
    ],
    desc: {
      es: "A complete commerce platform with automated payments, courier coordination, invoices and admin notifications.",
      en: "A complete commerce platform with automated payments, courier coordination, invoices and admin notifications.",
    },
    details: {
      es: "Fruitopia is an end-to-end e-commerce system designed to handle the full order journey. Customers can browse products, pay through the built-in payment flow and receive an automatic invoice after checkout. Courier integration keeps delivery operations connected, while the admin panel gives the business a central place to manage products and orders. Every new order also notifies the admin so nothing is missed.",
      en: "Fruitopia is an end-to-end e-commerce system designed to handle the full order journey. Customers can browse products, pay through the built-in payment flow and receive an automatic invoice after checkout. Courier integration keeps delivery operations connected, while the admin panel gives the business a central place to manage products and orders. Every new order also notifies the admin so nothing is missed.",
    },
    media: [
      "/projects/mir-labs/fruitopia.png",
    ],
    url: "https://v56pro.vercel.app",
    github: "https://github.com/mirlabss",
    highlights: ["react", "nodedotjs", "mongodb", "javascript"],
    align: "left",
    section: "project1",
  },
  {
    num: "02",
    name: { es: "Creamy", en: "Creamy" },
    stack: [
      "React",
      "JavaScript",
      "CSS animations",
      "Admin panel",
      "Responsive UI",
    ],
    desc: {
      es: "An animated ice-cream experience with a built-in admin panel for managing the content behind the storefront.",
      en: "An animated ice-cream experience with a built-in admin panel for managing the content behind the storefront.",
    },
    details: {
      es: "Creamy is a visual ice-cream website built to make browsing feel playful and memorable. The storefront uses motion, transitions and responsive layouts to give the products a premium presentation, while the built-in admin panel provides a practical way to manage the content and products. It balances a high-design front end with the operational controls needed behind it.",
      en: "Creamy is a visual ice-cream website built to make browsing feel playful and memorable. The storefront uses motion, transitions and responsive layouts to give the products a premium presentation, while the built-in admin panel provides a practical way to manage the content and products. It balances a high-design front end with the operational controls needed behind it.",
    },
    media: [
      "/projects/mir-labs/creamy.png",
    ],
    url: "https://cozysopi.vercel.app/",
    github: "https://github.com/mirlabss",
    highlights: ["react", "javascript", "css"],
    align: "right",
    section: "project2",
  },
  {
    num: "03",
    name: { es: "MemePumps", en: "MemePumps" },
    stack: [
      "React",
      "Next.js",
      "Node.js",
      "Trading Engine",
      "Real-Time Mint Scanner",
      "Whale Tracking",
      "Admin Fee Routing",
    ],
    desc: {
      es: "A live DexScreener-style token discovery and trading intelligence platform with custom per-trader secret fee controls managed via an advanced admin panel.",
      en: "A live DexScreener-style token discovery and trading intelligence platform with custom per-trader secret fee controls managed via an advanced admin panel.",
    },
    details: {
      es: "MemePumps is an advanced decentralized token discovery and trading platform inspired by DexScreener. It streams new mints the instant they are created with live logos, market cap filters, and dev-buy tracking. Beyond market scanning, whale monitoring, and trading signals, it features a bespoke admin engine where administrators can set up and adjust secret fee rates applied to individual traders on the fly.",
      en: "MemePumps is an advanced decentralized token discovery and trading platform inspired by DexScreener. It streams new mints the instant they are created with live logos, market cap filters, and dev-buy tracking. Beyond market scanning, whale monitoring, and trading signals, it features a bespoke admin engine where administrators can set up and adjust secret fee rates applied to individual traders on the fly.",
    },
    media: [
      "/projects/mir-labs/memepumps.png",
    ],
    url: "https://memepumps.vercel.app/",
    github: "https://github.com/mirlabss",
    highlights: ["react", "nodedotjs", "javascript", "typescript", "python"],
    align: "left",
    section: "project3",
  },
  {
    num: "04",
    name: { es: "MIR Labs Portfolio", en: "MIR Labs Portfolio" },
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "React Three Fiber",
      "Responsive design",
    ],
    desc: {
      es: "An interactive portfolio website with animation, responsive design and a 3D presentation layer for showcasing real work.",
      en: "An interactive portfolio website with animation, responsive design and a 3D presentation layer for showcasing real work.",
    },
    details: {
      es: "This portfolio brings the content from the original MIR Labs site into a more focused 3D experience. It keeps the important pieces—your name, skills, project stories, contact links and visual work—while adding a spatial keyboard scene, smooth scrolling, seasonal visual themes, responsive behavior and accessible project modals.",
      en: "This portfolio brings the content from the original MIR Labs site into a more focused 3D experience. It keeps the important pieces—your name, skills, project stories, contact links and visual work—while adding a spatial keyboard scene, smooth scrolling, seasonal visual themes, responsive behavior and accessible project modals.",
    },
    media: [
      "/projects/mir-labs/portfolio.png",
    ],
    url: "#",
    github: "https://github.com/mirlabss",
    highlights: ["nextdotjs", "react", "typescript", "html5", "css"],
    align: "right",
    section: "project4",
  },
];

const problemSolutions = [
  {
    iconType: "automation",
    badge: "AI & Workflow Automation",
    problemTitle: "The Problem",
    problemDesc:
      "Losing 15+ hours every week on manual data entry, lead follow-ups, and disconnected tools like spreadsheets and CRM.",
    solutionTitle: "My Solution",
    solutionDesc:
      "Custom n8n workflows and AI automation pipelines that capture leads, trigger instant WhatsApp/email responses, and sync databases 24/7.",
    impact: "10x Faster Operations · 0 Missed Leads",
  },
  {
    iconType: "web",
    badge: "High-Converting Web & E-Commerce",
    problemTitle: "The Problem",
    problemDesc:
      "Generic, slow websites with high bounce rates, clunky checkout experiences, and zero sales momentum.",
    solutionTitle: "My Solution",
    solutionDesc:
      "Bespoke Next.js & React web applications with 3D presentation, automated payment flows, instant invoices, and admin dashboards.",
    impact: "Ultra-Fast Load · Built to Convert Visitors",
  },
  {
    iconType: "custom",
    badge: "Custom Software & APIs",
    problemTitle: "The Problem",
    problemDesc:
      "Off-the-shelf SaaS apps are expensive, rigid, and don't match your unique operational requirements.",
    solutionTitle: "My Solution",
    solutionDesc:
      "Tailored full-stack systems, custom webhooks, and scalable databases built specifically around your exact business model.",
    impact: "100% Custom Tailored · Scalable & Secure",
  },
];

const crazyOffers = [
  {
    iconType: "clock",
    tag: "SPEED SPRINT",
    title: "4-Day Fast Delivery",
    desc: "From concept to a live working automation pipeline or MVP in 4 days or less.",
    highlight: "Fast Turnaround",
  },
  {
    iconType: "sparkles",
    tag: "100% FREE",
    title: "$0 Workflow & Tech Audit",
    desc: "I analyze your current business bottlenecks and build an automation roadmap at no cost.",
    highlight: "Zero Obligation",
  },
  {
    iconType: "shield",
    tag: "ZERO RISK",
    title: "Milestone-Based Approval",
    desc: "You only release payment once you see and approve each project milestone.",
    highlight: "Pay on Approval",
  },
  {
    iconType: "check",
    tag: "FULL PEACE OF MIND",
    title: "30 Days Free Support",
    desc: "Post-launch bug fixes, performance monitoring, and tweaks included free.",
    highlight: "Ongoing Care",
  },
];

const experiences: Array<{
  role: Localised;
  company: string;
  period: Localised;
  location: Localised;
  summary: Localised;
  bullets: Localised[];
  stack: string[];
}> = [
  {
    role: {
      es: "Full-stack Developer & AI Automation Specialist",
      en: "Full-stack Developer & AI Automation Specialist",
    },
    company: "MIR Labs",
    period: { es: "Building now", en: "Building now" },
    location: { es: "Bangladesh", en: "Bangladesh" },
    summary: {
      es: "I build functional, real-world software with a strong focus on web products, AI-driven workflow automation with n8n, and considered user interfaces.",
      en: "I build functional, real-world software with a strong focus on web products, AI-driven workflow automation with n8n, and considered user interfaces.",
    },
    bullets: [
      {
        es: "AI automation workflows and webhook integrations built using n8n and custom APIs.",
        en: "AI automation workflows and webhook integrations built using n8n and custom APIs.",
      },
      {
        es: "E-commerce flows with payment, invoice and courier automation.",
        en: "E-commerce flows with payment, invoice and courier automation.",
      },
      {
        es: "Admin panels and dashboards that turn complex business operations into clear workflows.",
        en: "Admin panels and dashboards that turn complex business operations into clear workflows.",
      },
      {
        es: "Responsive interfaces with animation, polish and practical performance.",
        en: "Responsive interfaces with animation, polish and practical performance.",
      },
    ],
    stack: [
      "n8n",
      "AI Automation",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "Git",
    ],
  },
];

function pick<T>(loc: { es: T; en: T }, lang: Lang): T {
  return loc[lang];
}

function HeroWord({
  text,
  delay,
  className = "",
}: {
  text: string;
  delay: number;
  className?: string;
}) {
  return (
    <span className={`hero-word ${className}`}>
      <span style={{ animationDelay: `${delay}ms` }}>{text}</span>
    </span>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Home() {
  const { t, lang } = useLanguage();
  const isMobile = useIsMobile();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <SmoothScroll>
      <div className="relative">
        {!isMobile && (
          <div className="fixed inset-0 z-0">
            <FrozenKeyboard />
          </div>
        )}

        <header className="fixed top-0 inset-x-0 z-50 px-6 sm:px-10 md:px-14 py-5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <span data-cursor="hover" className="text-sm font-semibold tracking-tight text-ice-100 whitespace-nowrap">
              MIR Labs
            </span>
            <span className="hidden md:inline-flex">
              <span className="status-pill">{t("header.availability")}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <SeasonPicker />
            <span className="hidden md:inline-flex">
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" data-cursor="hover" className="frost-btn !py-1.5 !px-3 !text-xs">
                <GithubIcon />
                <span>GitHub</span>
              </a>
            </span>
          </div>
        </header>

        <SectionNav />

        <main className="relative z-10 pointer-events-none">
          <section data-kb-section="hero" className="min-h-screen flex flex-col justify-center p-6 sm:p-10 md:p-14">
            {isMobile && (
              <div className="w-full h-[34vh] mt-12 -mb-4 pointer-events-auto">
                <FrozenKeyboard mobile />
              </div>
            )}
            <div className="mt-2 md:mt-20">
              <p className="text-[11px] uppercase tracking-[0.3em] text-ice-300 mb-5 fade-in-up" style={{ ["--d" as string]: "0ms" }}>
                {t("hero.greeting")} Mahfuj
              </p>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-bold tracking-[-0.03em] text-ice-50 leading-[0.92] whitespace-nowrap">
                <HeroWord text="MIR" delay={120} />
                <br />
                <HeroWord text="Labs." delay={260} className="text-ice-400" />
              </h1>
              <p className="mt-8 text-base sm:text-lg md:text-xl text-ice-200 max-w-xl leading-relaxed fade-in-up" style={{ ["--d" as string]: "520ms" }}>
                Full-stack developer &amp; AI automation builder.
                <br />
                Building intelligent workflows with n8n, modern web apps and high-design experiences.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3 pointer-events-auto fade-in-up" style={{ ["--d" as string]: "700ms" }}>
                <a href="/cv_en.pdf" target="_blank" rel="noopener noreferrer" data-cursor="hover" data-magnetic className="frost-btn frost-btn--primary">
                  {t("hero.cv")}
                </a>
                <button type="button" data-cursor="hover" data-magnetic className="frost-btn" onClick={() => document.querySelector<HTMLElement>('[data-kb-section="contact"]')?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  {t("hero.hire")}
                </button>
                <div className="basis-full h-0 md:hidden" aria-hidden />
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-magnetic className="frost-icon" aria-label="WhatsApp"><WhatsappIcon /></a>
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-magnetic className="frost-icon" aria-label="LinkedIn"><LinkedinIcon /></a>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-magnetic className="frost-icon" aria-label="GitHub"><GithubIcon /></a>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-magnetic className="frost-icon" aria-label="Instagram"><InstagramIcon /></a>
              </div>
            </div>
            <div className="mt-10 md:mt-auto flex items-center gap-3 fade-in-up" style={{ ["--d" as string]: "900ms" }}>
              <span className="scroll-indicator">
                <span>{t("hero.scroll")}</span>
                <span className="scroll-indicator__rail" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.25em] text-ice-400 hidden sm:inline">
                {t("hero.keysHint")}
              </span>
            </div>
          </section>

          <section data-kb-section="stack" className="relative md:min-h-[200vh] p-6 sm:p-10 md:p-14">
            <div className="relative md:h-[150vh]">
              <div className="md:sticky md:top-28 text-center">
                <Reveal>
                  <h2 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[-0.03em] text-ice-50 leading-[0.95]">{t("stack.title")}</h2>
                </Reveal>
                <Reveal delay={120}>
                  <p className="mt-3 text-sm sm:text-base text-ice-400">{t("stack.hintMobile")}</p>
                </Reveal>
              </div>
              {isMobile && (
                <div className="md:hidden mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pointer-events-auto">
                  {SKILLS_FLAT.map((s) => (
                    <div key={s.slug} className="flex items-start gap-3 rounded-xl bg-ink-1/70 backdrop-blur-sm border border-ink-3 p-4">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill={`#${s.hex}`} className="flex-none mt-0.5" aria-hidden><path d={s.path} /></svg>
                      <div>
                        <p className="text-ice-50 font-medium text-sm">{s.title}</p>
                        <p className="text-ice-400 text-xs mt-0.5 leading-snug">{t(`keyboard.taglines.${s.slug}`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section data-kb-section="experience" className="relative p-6 sm:p-10 md:p-14 pb-28">
            <div className="sticky top-24 sm:top-28 text-center mb-12 sm:mb-16 z-0">
              <Reveal>
                <span className="status-pill mb-3 inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-ice-300" />
                  <span>CLIENT SOLUTIONS &amp; VALUE OFFERS</span>
                </span>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.03em] text-ice-50 leading-[0.98]">
                  {t("experience.title")}
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-4 text-sm sm:text-base md:text-lg text-ice-300 max-w-2xl mx-auto leading-relaxed">
                  {t("experience.subtitle")}
                </p>
              </Reveal>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
              {/* Problem vs Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {problemSolutions.map((item, idx) => (
                  <Reveal key={idx} delay={idx * 100} className="h-full">
                    <div className="h-full flex flex-col justify-between rounded-2xl bg-ink-1/80 backdrop-blur-md border border-ink-3 hover:border-ice-400/40 transition-all duration-300 p-6 sm:p-7 pointer-events-auto shadow-[0_8px_40px_-20px_rgba(0,0,0,0.6)]">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-ink-2/90 border border-ink-3 flex items-center justify-center text-ice-200">
                            {item.iconType === "automation" && <Bot className="w-5 h-5 text-ice-200" />}
                            {item.iconType === "web" && <Globe className="w-5 h-5 text-ice-200" />}
                            {item.iconType === "custom" && <Layers className="w-5 h-5 text-ice-200" />}
                          </div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-ice-300 bg-ink-2/80 px-2.5 py-1 rounded-full border border-ice-700/50">
                            {item.badge}
                          </span>
                        </div>

                        {/* The Problem */}
                        <div className="mb-4 pb-4 border-b border-ink-3/80">
                          <p className="text-xs uppercase tracking-wider font-semibold text-rose-400 mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {item.problemTitle}
                          </p>
                          <p className="text-xs sm:text-sm text-ice-300/90 leading-relaxed">
                            {item.problemDesc}
                          </p>
                        </div>

                        {/* The Solution */}
                        <div>
                          <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {item.solutionTitle}
                          </p>
                          <p className="text-xs sm:text-sm text-ice-100 leading-relaxed">
                            {item.solutionDesc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-ink-3/60">
                        <p className="text-[11px] font-mono text-ice-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-none" />
                          <span className="text-ice-200">{item.impact}</span>
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Crazy Offers Banner */}
              <Reveal delay={200}>
                <div className="rounded-2xl bg-gradient-to-b from-ink-1/90 to-ink-0/90 backdrop-blur-md border border-ice-500/30 p-6 sm:p-8 md:p-10 pointer-events-auto shadow-[0_12px_50px_-20px_rgba(77,133,182,0.25)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-ice-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.2em] text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mb-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>My Client Guarantees</span>
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-ice-50 tracking-tight">
                          Crazy Offers That Make Hiring Me a No-Brainer
                        </h3>
                      </div>
                      <a
                        href={`https://wa.me/8801322205149?text=${encodeURIComponent(
                          "Hi MIR Labs, I would like to claim the Free Automation Audit & discuss working together with your special offer."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="hover"
                        data-magnetic
                        className="frost-btn !bg-emerald-500/25 !border-emerald-400/50 hover:!bg-emerald-500/40 text-emerald-100 hover:text-white flex items-center gap-2 !py-3 !px-5 !text-sm"
                      >
                        <WhatsappIcon />
                        <span>Claim Free Audit on WhatsApp</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
                      {crazyOffers.map((offer, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-ink-2/60 border border-ink-3 p-4 flex flex-col justify-between hover:border-ice-400/30 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-mono font-semibold text-amber-300 uppercase flex items-center gap-1">
                                {offer.iconType === "clock" && <Clock className="w-3 h-3 text-amber-300" />}
                                {offer.iconType === "sparkles" && <Sparkles className="w-3 h-3 text-amber-300" />}
                                {offer.iconType === "shield" && <Shield className="w-3 h-3 text-amber-300" />}
                                {offer.iconType === "check" && <CheckCircle2 className="w-3 h-3 text-amber-300" />}
                                <span>{offer.tag}</span>
                              </span>
                              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                {offer.highlight}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-ice-50 mb-1">
                              {offer.title}
                            </h4>
                            <p className="text-xs text-ice-300 leading-snug">
                              {offer.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-ink-3 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono text-ice-200">
                          Currently taking <strong>2 new client projects</strong> this month
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {["n8n", "AI Automation", "React", "Next.js", "Node.js", "Python", "TypeScript", "REST APIs", "Git"].map(
                          (s) => (
                            <span
                              key={s}
                              data-cursor="hover"
                              className="frost-chip !text-[11px] !py-0.5 !px-2.5"
                            >
                              {s}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Animated Projects Showcase Intro Header */}
          <section className="relative pt-24 sm:pt-32 pb-8 px-6 sm:px-10 md:px-14 text-center">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <span className="status-pill mb-4 inline-flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-ice-300" />
                  <span>SELECTED CASE STUDIES</span>
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[-0.03em] text-ice-50 leading-[0.95]">
                  Projects I Made.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-4 text-sm sm:text-base md:text-lg text-ice-300 max-w-xl mx-auto leading-relaxed">
                  Real-world web applications, AI automation pipelines, and digital platforms built with precision.
                </p>
              </Reveal>
            </div>
          </section>

          {projects.map((p) => (
            <section key={p.num} data-kb-section={p.section} data-kb-highlights={(p.highlights ?? []).join(",")} className="relative py-20 md:min-h-screen flex items-center p-6 sm:p-10 md:p-14 overflow-hidden">
              <span aria-hidden className={`watermark hidden md:block top-1/2 -translate-y-1/2 ${p.align === "left" ? "right-[-2vw]" : "left-[-2vw]"}`}>{p.num}</span>
              <div className={p.align === "left" ? "max-w-xl relative" : "max-w-xl relative md:ml-auto md:text-right md:mr-16 lg:mr-24"}>
                <Reveal><p className="font-mono text-sm text-ice-400 mb-3">{p.num} · {t("projects.kicker")}</p></Reveal>
                <Reveal delay={80}><h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-ice-50 leading-[1.05] mb-4">{pick(p.name, lang)}</h2></Reveal>
                <Reveal delay={180}><p className="text-base sm:text-lg text-ice-200 leading-relaxed mb-6">{pick(p.desc, lang)}</p></Reveal>
                <Reveal delay={260}>
                  <div className={p.align === "right" ? "flex flex-wrap gap-1.5 md:justify-end pointer-events-auto mb-5" : "flex flex-wrap gap-1.5 pointer-events-auto mb-5"}>
                    {p.stack.map((s) => <span key={s} data-cursor="hover" className="frost-chip">{s}</span>)}
                  </div>
                </Reveal>
                <Reveal delay={320}>
                  <div className={p.align === "right" ? "flex flex-wrap gap-2.5 md:justify-end pointer-events-auto" : "flex flex-wrap gap-2.5 pointer-events-auto"}>
                    <button type="button" onClick={() => setActiveProject(p)} data-cursor="hover" data-magnetic className="frost-btn">
                      <span>{t("projects.viewMore")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-magnetic className="frost-btn">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t("projects.openSite")}</span>
                      </a>
                    )}
                    <a
                      href={`https://wa.me/8801322205149?text=${encodeURIComponent(
                        `Hi MIR Labs, I would like to order/build a website like "${pick(p.name, lang)}"${p.url ? ` (${p.url})` : ""}. Could you share the details, pricing and timeline?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      data-magnetic
                      className="frost-btn !bg-emerald-600/25 !border-emerald-400/40 hover:!bg-emerald-600/40 text-emerald-200 hover:text-white flex items-center gap-1.5"
                    >
                      <WhatsappIcon />
                      <span>{t("projects.orderWebsite")}</span>
                    </a>
                  </div>
                </Reveal>
              </div>
            </section>
          ))}

          <section data-kb-section="contact" className="relative py-24 md:min-h-screen flex flex-col justify-center p-6 sm:p-10 md:p-14 overflow-hidden">
            <div className="max-w-xl relative">
              <Reveal><p className="font-mono text-sm text-ice-400 mb-3">{t("contact.kicker")}</p></Reveal>
              <Reveal delay={80}><h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-ice-50 mb-4">{t("contact.title")}</h2></Reveal>
              <Reveal delay={140}><p className="text-ice-200 mb-6">Have a product idea, an AI or n8n workflow to automate, or a web application that needs a stronger point of view? Let&apos;s build it properly.</p></Reveal>

              <Reveal delay={200} className="mb-6">
                <ContactForm />
              </Reveal>

              <Reveal delay={280}>
                <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
                  <span className="text-xs text-ice-400 font-mono mr-1">Direct channels:</span>
                  <CopyEmail email={EMAIL} className="frost-btn !py-2 !px-3.5 !text-xs">{t("contact.copyEmail")}</CopyEmail>
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" data-cursor="hover" className="frost-btn !py-2 !px-3.5 !text-xs flex items-center gap-1.5">
                    <WhatsappIcon />
                    <span>WhatsApp</span>
                  </a>
                  <a href={GITHUB} target="_blank" rel="noopener noreferrer" data-cursor="hover" className="frost-btn !py-2 !px-3.5 !text-xs flex items-center gap-1.5">
                    <GithubIcon />
                    <span>{t("contact.github")}</span>
                  </a>
                </div>
              </Reveal>
            </div>
            <Reveal delay={340}><p className="mt-14 text-[11px] uppercase tracking-[0.25em] text-ice-400">{t("contact.footer")}</p></Reveal>
          </section>
        </main>

        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      </div>
    </SmoothScroll>
  );
}