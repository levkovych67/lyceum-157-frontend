import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const privateAreas = [
    "/parent/",
    "/student/",
    "/admin/",
    "/account",
    "/cart",
    "/checkout",
    "/checkout/success",
    "/checkout/failure",
    "/login",
    "/register",
    "/_kitchen",
    "/api/",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privateAreas },
      { userAgent: "GPTBot", allow: "/", disallow: privateAreas },
      { userAgent: "ClaudeBot", allow: "/", disallow: privateAreas },
      { userAgent: "PerplexityBot", allow: "/", disallow: privateAreas },
      { userAgent: "Google-Extended", allow: "/", disallow: privateAreas },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: privateAreas },
      { userAgent: "CCBot", allow: "/", disallow: privateAreas },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
