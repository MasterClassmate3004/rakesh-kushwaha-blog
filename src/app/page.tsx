import { prisma } from "@/lib/prisma"
import PageTransition from "@/components/PageTransition"
import HomeFeed from "@/components/HomeFeed"
import LandingHero3D from "@/components/LandingHero3D"
import { siteConfig } from "@/lib/site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
}

export const revalidate = 60

export default async function HomePage() {
  const now = new Date()
  let posts: any[] = []
  try {
    posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [{ publishAt: null }, { publishAt: { lte: now } }],
      } as any,
      select: {
        id: true,
        slug: true,
        title: true,
        caption: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Home page database connection failed during build/render:", error)
    // Build stays alive even if DB is down
  }

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                name: siteConfig.authorName,
                url: siteConfig.siteUrl,
              },
              {
                "@type": "Blog",
                name: siteConfig.name,
                description: siteConfig.description,
                url: siteConfig.siteUrl,
                author: {
                  "@type": "Person",
                  name: siteConfig.authorName,
                },
              },
              {
                "@type": "WebSite",
                name: siteConfig.name,
                url: siteConfig.siteUrl,
              },
            ],
          }),
        }}
      />
      <LandingHero3D />

      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted glass-card rounded-2xl">
          <p>No posts published yet. Check back soon!</p>
        </div>
      ) : (
        <HomeFeed
          posts={posts.map((post: any) => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            caption: post.caption,
            imageUrl: post.imageUrl,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
          }))}
        />
      )}
    </PageTransition>
  )
}
