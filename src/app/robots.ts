import type { MetadataRoute } from "next";
import { BASE_URL } from "./lib/config/settings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: BASE_URL,
  };
}
