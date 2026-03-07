import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PageTransition from "@/components/PageTransition"
import CommentSection from "@/components/CommentSection"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { sanitizeHtml } from "@/lib/sanitize"
import BlogCard from "@/components/BlogCard"
import { formatDateDDMMYYYY } from "@/lib/date"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"
import ReadingProgressBar from "@/components/ReadingProgressBar"

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params
    let post: any = null
    try {
        post = await prisma.post.findUnique({
            where: { slug: params.slug },
            select: {
                title: true,
                caption: true,
                content: true,
                imageUrl: true,
                published: true,
            },
        })
    } catch (error) {
        console.error("Metadata fetch failed:", error)
    }

    if (!post || !post.published) {
        return {
            title: "Post",
        }
    }

    const description =
        post.caption ||
        post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)

    const url = `${siteConfig.siteUrl}/blog/${params.slug}`
    return {
        title: post.title,
        description,
        alternates: {
            canonical: `/blog/${params.slug}`,
        },
        openGraph: {
            title: post.title,
            description,
            type: "article",
            url,
            images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
            images: post.imageUrl ? [post.imageUrl] : undefined,
        },
    }
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const now = new Date()
    let post: any = null
    try {
        post = await prisma.post.findFirst({
            where: {
                slug: params.slug,
                published: true,
                OR: [{ publishAt: null }, { publishAt: { lte: now } }],
            } as any,
            include: {
                comments: {
                    where: { status: "APPROVED", parentId: null } as any,
                    orderBy: { createdAt: "desc" } as any,
                    include: {
                        author: {
                            select: { name: true, image: true } as any
                        },
                        replies: {
                            where: { status: "APPROVED" } as any,
                            orderBy: { createdAt: "asc" } as any,
                            include: {
                                author: {
                                    select: { name: true, image: true } as any
                                }
                            } as any
                        } as any,
                    }
                } as any
            } as any
        })
    } catch (error) {
        console.error("Post fetch failed:", error)
    }

    if (!post) {
        notFound()
    }

    let recommendedPosts: any[] = []
    try {
        recommendedPosts = await prisma.post.findMany({
            where: {
                published: true,
                slug: { not: post.slug },
                OR: [{ publishAt: null }, { publishAt: { lte: now } }],
            } as any,
            orderBy: { createdAt: "desc" },
            take: 3,
        })
    } catch (error) {
        console.error("Recommended posts fetch failed:", error)
    }

    const cleanContent = sanitizeHtml(post.content || "")
    const readMinutes = Math.max(1, Math.ceil(cleanContent.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length / 200))

    return (
        <PageTransition>
            <ReadingProgressBar targetId="blog-post-article" />
            <Link href="/" className="inline-flex items-center text-primary hover:text-white transition-colors mb-10 group mt-4">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to all posts
            </Link>

            <article id="blog-post-article" className="max-w-3xl mx-auto">
                <header className="mb-14 text-center">
                    <p className="text-sky-300 font-medium tracking-wide mb-2" suppressHydrationWarning>
                        {formatDateDDMMYYYY(post.createdAt, true)} • {readMinutes} min read
                    </p>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
                        {post.title}
                    </h1>
                    {post.caption && (
                        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
                            {post.caption}
                        </p>
                    )}
                    {post.imageUrl && (
                        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </header>

                <div
                    className="post-content prose prose-invert prose-lg max-w-none prose-p:text-neutral-300 prose-headings:text-white prose-a:text-primary hover:prose-a:text-white"
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                />

                <CommentSection postId={post.id} comments={(post as any).comments} />

                {recommendedPosts.length > 0 && (
                    <section className="mt-16 pt-10 border-t border-white/10">
                        <h3 className="text-2xl font-bold mb-2">Keep Reading</h3>
                        <p className="text-muted mb-6">You might also like these posts.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendedPosts.map((rec: any) => (
                                <BlogCard
                                    key={rec.id}
                                    slug={rec.slug}
                                    title={rec.title}
                                    dateLabel={formatDateDDMMYYYY(rec.createdAt, true)}
                                    caption={rec.caption || rec.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) + "..."}
                                    imageUrl={rec.imageUrl}
                                    imageVersion={rec.updatedAt?.toISOString?.() ?? String(rec.updatedAt ?? "")}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </PageTransition>
    )
}
