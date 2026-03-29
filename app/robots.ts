import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/user/services", "/user/pricing", "/user/products", "/user/quote", "/user/exchange", "/user/contact"],
        disallow: ["/admin/", "/user/dashboard/", "/user/cart/", "/user/orders/", "/user/profile/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
