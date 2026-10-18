import type { Metadata, Viewport } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import FrozenBackground from "@/components/FrozenBackground";
import ScrollProgress from "@/components/ScrollProgress";
import MagneticTargets from "@/components/MagneticTargets";
import SeasonProvider, {
  SEASON_BOOT_SCRIPT,
} from "@/components/SeasonProvider";
import LanguageProvider, {
  LANG_BOOT_SCRIPT,
} from "@/components/LanguageProvider";
import { getSiteUrl, getCanonicalUrl, SITE_METADATA } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MIR Labs — Full-Stack Developer & AI Automation Engineer",
    template: "%s | MIR Labs",
  },
  description: SITE_METADATA.description,
  authors: [{ name: SITE_METADATA.author, url: siteUrl }],
  creator: SITE_METADATA.author,
  publisher: "MIR Labs",
  alternates: {
    canonical: getCanonicalUrl(),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      process.env.GOOGLE_SITE_VERIFICATION ||
      undefined,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "MIR Labs — Full-Stack Developer & AI Automation Engineer",
    description: SITE_METADATA.description,
    url: siteUrl,
    type: "website",
    locale: "en_US",
    siteName: "MIR Labs",
    images: [
      {
        url: getCanonicalUrl("/logo-mir-labs.png"),
        width: 1200,
        height: 630,
        alt: "MIR Labs — 3D Portfolio & Digital Laboratory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIR Labs — Full-Stack Developer & AI Automation Engineer",
    description: SITE_METADATA.description,
    images: [getCanonicalUrl("/logo-mir-labs.png")],
  },
};

const rootJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "MIR Labs",
      description: SITE_METADATA.description,
      publisher: {
        "@id": `${siteUrl}/#person`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "MIR Labs (Mahfuj)",
      alternateName: ["Mahfuj", "MIR Labs"],
      url: siteUrl,
      jobTitle: "Full-Stack Software Engineer & AI Automation Developer",
      sameAs: [
        SITE_METADATA.github,
        SITE_METADATA.instagram,
        SITE_METADATA.linkedin,
      ],
      knowsAbout: [
        "Full-Stack Web Development",
        "AI Workflow Automation with n8n",
        "React & Next.js",
        "Three.js & 3D Interactive Graphics",
        "REST APIs & Webhooks",
        "E-Commerce Architecture",
      ],
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profilepage`,
      url: siteUrl,
      name: "MIR Labs Portfolio & Engineering Vault",
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
      about: {
        "@id": `${siteUrl}/#person`,
      },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#060e1c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data: WebSite, Person & ProfilePage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
        {/* Run synchronously before hydration to apply the user's stored
            season + language — avoids a flash of the default values. */}
        <script dangerouslySetInnerHTML={{ __html: SEASON_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT_SCRIPT }} />
      </head>
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <SeasonProvider>
            <FrozenBackground />
            <ScrollProgress />
            {children}
            <CustomCursor />
            <MagneticTargets />
          </SeasonProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
