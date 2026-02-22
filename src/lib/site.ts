export const siteConfig = {
  name: "Rakesh Kushwaha Blogs",
  shortName: "Rakesh Kushwaha Blog",
  description:
    "Rakesh Kushwaha's official blog on software engineering, design systems, and product building.",
  authorName: "Rakesh Kushwaha",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL.startsWith("http")
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://rakesh-kushwaha-blog.vercel.app",
  keywords: [
    "Rakesh Kushwaha",
    "Rakesh Kushwaha Blogs",
    "Rakesh Kushwaha Blog",
    "software engineering blog",
    "next.js blog",
    "web development",
  ],
}
