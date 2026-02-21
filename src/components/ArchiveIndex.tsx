"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Search } from "lucide-react"
import { formatDateDDMMYYYY } from "@/lib/date"

type ArchivePost = {
    id: string
    slug: string
    title: string
    createdAt: string
}

function formatMonthLabel(createdAt: string) {
    const date = new Date(createdAt)
    if (Number.isNaN(date.getTime())) return "Unknown Month"
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(date)
}

function formatDateLabel(createdAt: string) {
    return formatDateDDMMYYYY(createdAt, true)
}

export default function ArchiveIndex({ posts }: { posts: ArchivePost[] }) {
    const [query, setQuery] = useState("")

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return posts
        return posts.filter((post) => post.title.toLowerCase().includes(q))
    }, [posts, query])

    const groups = useMemo(() => {
        const monthMap = new Map<string, ArchivePost[]>()
        for (const post of filtered) {
            const month = formatMonthLabel(post.createdAt)
            const bucket = monthMap.get(month)
            if (bucket) {
                bucket.push(post)
            } else {
                monthMap.set(month, [post])
            }
        }
        return Array.from(monthMap.entries()).map(([month, monthPosts]) => ({ month, posts: monthPosts }))
    }, [filtered])

    return (
        <div className="space-y-8">
            <section className="glass-card rounded-3xl p-5 md:p-6 border border-white/10 sticky top-20 z-20">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <Search className="w-4 h-4 text-primary" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search blog titles..."
                        className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm"
                    />
                </div>
            </section>

            {groups.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center text-muted">No posts found.</div>
            ) : (
                <div className="space-y-6">
                    {groups.map((group, groupIndex) => (
                        <motion.section
                            key={group.month}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ delay: groupIndex * 0.03 }}
                            className="glass-card rounded-3xl p-5 md:p-6 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                <h2 className="text-lg font-semibold tracking-wide">{group.month}</h2>
                            </div>

                            <div className="divide-y divide-white/10">
                                {group.posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="py-3 flex items-start justify-between gap-4 hover:bg-white/5 rounded-xl px-2 -mx-2 transition-colors"
                                    >
                                        <p className="text-sm md:text-base text-white/95">{post.title}</p>
                                        <span className="text-xs md:text-sm text-sky-300 shrink-0 pt-0.5">
                                            {formatDateLabel(post.createdAt)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </motion.section>
                    ))}
                </div>
            )}
        </div>
    )
}
