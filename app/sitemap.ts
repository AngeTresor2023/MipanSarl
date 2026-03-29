import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base,                       lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/about`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/user/services`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/user/pricing`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/user/products`,    lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/user/quote`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/user/exchange`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/user/contact`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/auth/login`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/auth/sign-up`,     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
