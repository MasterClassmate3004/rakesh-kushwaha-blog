import { prisma } from "@/lib/prisma"
import PageTransition from "@/components/PageTransition"
import ArchiveIndex from "@/components/ArchiveIndex"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Archive",
    description: "Browse all published posts month by month.",
    alternates: {
        canonical: "/archive",
    },
}

export const revalidate = 60

export default async function ArchivePage() {
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
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        })
    } catch (error) {
        console.error("Archive page database connection failed during build/render:", error)
    }

    return (
        <PageTransition>
            <div className="space-y-3 mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Archive</h1>
                <p className="text-muted">
                    Browse all published posts by month and date.
                </p>
            </div>

            <ArchiveIndex
                posts={posts.map((post: any) => ({
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    createdAt: post.createdAt.toISOString(),
                }))}
            />
        </PageTransition>
    )
}
