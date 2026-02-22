"use client"

import { useState } from "react"
import { addAuthorReply, addComment } from "@/app/actions/comments"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { formatDateTimeDDMMYYYY } from "@/lib/date"

interface Comment {
    id: string
    text: string
    createdAt: Date
    author: {
        name: string | null
        image?: string | null
    }
    replies?: Comment[]
}

interface CommentSectionProps {
    postId: string
    comments: Comment[]
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
    const { data: session } = useSession()
    const isAuthor = (session?.user as any)?.role === "ADMIN"
    const [text, setText] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState("")
    const [replyByComment, setReplyByComment] = useState<Record<string, string>>({})
    const [isReplying, setIsReplying] = useState<Record<string, boolean>>({})
    const [replyMessage, setReplyMessage] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim()) return
        setIsSubmitting(true)
        setMessage("")

        const result = await addComment(postId, text)
        if (result.error) {
            setMessage(result.error)
        } else {
            setMessage("Comment submitted successfully! It will appear after admin approval.")
            setText("")
        }
        setIsSubmitting(false)
    }

    const handleReply = async (commentId: string, e: React.FormEvent) => {
        e.preventDefault()
        const replyText = (replyByComment[commentId] || "").trim()
        if (!replyText) return

        setIsReplying((prev) => ({ ...prev, [commentId]: true }))
        setReplyMessage((prev) => ({ ...prev, [commentId]: "" }))

        const result = await addAuthorReply(commentId, replyText)
        if (result.error) {
            setReplyMessage((prev) => ({ ...prev, [commentId]: result.error as string }))
        } else {
            setReplyByComment((prev) => ({ ...prev, [commentId]: "" }))
            setReplyMessage((prev) => ({ ...prev, [commentId]: "Reply posted." }))
        }

        setIsReplying((prev) => ({ ...prev, [commentId]: false }))
    }

    return (
        <div className="mt-16 pt-10 border-t border-white/10">
            <h3 className="text-2xl font-bold mb-8">Comments</h3>

            {session ? (
                <form onSubmit={handleSubmit} className="mb-12">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-y mb-4"
                        required
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">{message}</span>
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="bg-primary text-white font-semibold px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            Post Comment
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center mb-12">
                    <p className="text-muted mb-4">You must be logged in to post a comment.</p>
                    <a href="/login" className="text-primary font-medium hover:underline">
                        Sign In / Register
                    </a>
                </div>
            )}

            <div className="space-y-6">
                <AnimatePresence>
                    {comments.length === 0 ? (
                        <p className="text-muted">No comments yet. Be the first to start the discussion!</p>
                    ) : (
                        comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-6 rounded-2xl border border-white/5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-black/40 border border-white/10">
                                            <img
                                                src={comment.author.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${comment.author.name || 'User'}&backgroundColor=b6e3f4`}
                                                alt={comment.author.name || "User"}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <span className="font-bold text-white block leading-none mb-1">
                                                {comment.author.name || "Anonymous"}
                                            </span>
                                            <span className="text-xs text-muted block" suppressHydrationWarning>
                                                {formatDateTimeDDMMYYYY(comment.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-neutral-300 leading-relaxed pl-13">{comment.text}</p>

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-4 ml-6 space-y-3 border-l border-white/10 pl-4">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                                        {reply.author.name || "Author"}
                                                    </span>
                                                    <span className="text-xs text-muted" suppressHydrationWarning>
                                                        {formatDateTimeDDMMYYYY(reply.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-300 text-sm leading-relaxed">{reply.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isAuthor && (
                                    <form onSubmit={(e) => handleReply(comment.id, e)} className="mt-4 ml-6 border-l border-primary/30 pl-4">
                                        <textarea
                                            value={replyByComment[comment.id] || ""}
                                            onChange={(e) => setReplyByComment((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                            placeholder="Write an author reply..."
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[70px] resize-y mb-2 text-sm"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-green-400">{replyMessage[comment.id] || ""}</span>
                                            <button
                                                type="submit"
                                                disabled={isReplying[comment.id]}
                                                className="bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
                                            >
                                                {isReplying[comment.id] ? "Posting..." : "Post Reply"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
