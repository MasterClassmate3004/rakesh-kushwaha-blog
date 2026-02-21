import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PageTransition from "@/components/PageTransition"
import CommentSection from "@/components/CommentSection"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const post = await prisma.post.findFirst({
        where: { slug: params.slug, published: true } as any,
        include: {
            comments: {
                where: { status: "APPROVED" } as any,
                orderBy: { createdAt: "desc" } as any,
                include: {
                    author: {
                        select: { name: true, image: true } as any
                    }
                }
            } as any
        } as any
    }) as any

    if (!post) {
        notFound()
    }

    return (
        <PageTransition>
            <Link href="/" className="inline-flex items-center text-primary hover:text-white transition-colors mb-10 group mt-4">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to all posts
            </Link>

            <article className="max-w-3xl mx-auto">
                <header className="mb-14 text-center">
                    <p className="text-primary font-medium tracking-wide mb-4" suppressHydrationWarning>
                        {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(post.createdAt)}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
                        {post.title}
                    </h1>
                    {post.imageUrl && (
                        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                </header>

                <div
                    className="prose prose-invert prose-lg max-w-none prose-p:text-neutral-300 prose-headings:text-white prose-a:text-primary hover:prose-a:text-white"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <CommentSection postId={post.id} comments={(post as any).comments} />
            </article>
        </PageTransition>
    )
}
