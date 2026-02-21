import { prisma } from "@/lib/prisma"
import BlogCard from "@/components/BlogCard"
import PageTransition from "@/components/PageTransition"
import { connection } from 'next/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Official Next.js 15 pattern for dynamic rendering
  await connection()

  let posts: any[] = []
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" }
    })
  } catch (error) {
    console.error("Home page database connection failed during build/render:", error)
    // Build stays alive even if DB is down
  }

  return (
    <PageTransition>
      <div className="flex flex-col items-center mb-16 mt-8 text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 py-2">
          Thoughts & Ideas
        </h1>
        <p className="text-muted max-w-2xl text-lg">
          Exploring software engineering, design patterns, and building premium user experiences.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted glass-card rounded-2xl">
          <p>No posts published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post: any) => (
            <BlogCard
              key={post.id}
              id={post.id}
              slug={post.slug}
              title={post.title}
              date={post.createdAt}
              excerpt={post.content.replace(/<[^>]+>/g, '').substring(0, 150) + "..."} // naive HTML stripping for excerpt
              imageUrl={post.imageUrl}
            />
          ))}
        </div>
      )}
    </PageTransition>
  )
}
