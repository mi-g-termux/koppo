import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/share", "/share/*"],
        disallow: ["/admin", "/share/admin", "/api/"],
      },
    ],
    sitemap: getCanonicalUrl("/sitemap.xml"),
  };
}
