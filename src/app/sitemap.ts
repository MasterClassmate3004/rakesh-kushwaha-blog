import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { siteConfig } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]

  try {
    const now = new Date()
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [{ publishAt: null }, { publishAt: { lte: now } }],
      } as any,
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const postRoutes: MetadataRoute.Sitemap = posts.map((post: any) => ({
      url: `${siteConfig.siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    }))

    return [...staticRoutes, ...postRoutes]
  } catch (error) {
    console.error("Sitemap generation failed:", error)
    return staticRoutes
  }
}

