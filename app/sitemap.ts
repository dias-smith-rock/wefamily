import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { languageAlternates, localizedUrl } from "@/lib/seo";

const STATIC_PATHS = ["/", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.6,
      alternates: {
        languages: languageAlternates(path),
      },
    })),
  );
}
