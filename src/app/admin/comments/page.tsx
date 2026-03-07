import { prisma } from "@/lib/prisma"
import { updateCommentStatus } from "@/app/actions/admin"
import { Check, X } from "lucide-react"

export default async function CommentsModerationPage() {
    let comments: any[] = []
    try {
        comments = await prisma.comment.findMany({
            where: { status: "PENDING" },
            include: {
                post: { select: { title: true } },
                author: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: "asc" }
        })
    } catch (error) {
        console.error("Comments moderation DB connection failed:", error)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Comment Moderation</h1>
                <p className="text-muted">Review and approve viewer comments before they appear publicly.</p>
            </div>

            {comments.length === 0 ? (
                <div className="glass-card p-10 text-center rounded-2xl text-muted">
                    All caught up! No pending comments to review.
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment: any) => (
                        <div key={comment.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-bold text-white">{comment.author.name || "Anonymous"}</span>
                                    <span className="text-muted text-sm">({comment.author.email})</span>
                                    <span className="text-muted text-sm px-2">•</span>
                                    <span className="text-primary text-sm font-medium">on "{comment.post.title}"</span>
                                </div>
                                <p className="text-neutral-300 bg-white/5 p-4 rounded-xl border border-white/10">
                                    {comment.text}
                                </p>
                            </div>

                            <div className="flex space-x-3 w-full md:w-auto mt-4 md:mt-0">
                                <form action={updateCommentStatus.bind(null, comment.id, "APPROVED")} className="flex-1">
                                    <button className="w-full flex items-center justify-center bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-3 rounded-xl font-medium transition-colors">
                                        <Check className="w-5 h-5 mr-2" /> Approve
                                    </button>
                                </form>

                                <form action={updateCommentStatus.bind(null, comment.id, "REJECTED")} className="flex-1">
                                    <button className="w-full flex items-center justify-center bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-3 rounded-xl font-medium transition-colors">
                                        <X className="w-5 h-5 mr-2" /> Reject
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
