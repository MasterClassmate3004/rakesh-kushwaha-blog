"use client"

import { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion"
import { Search, CalendarDays } from "lucide-react"
import BlogCard from "@/components/BlogCard"
import { formatDateDDMMYYYY } from "@/lib/date"

type FeedPost = {
    id: string
    slug: string
    title: string
    caption?: string | null
    content: string
    imageUrl?: string | null
    createdAt: string
}

function formatDateLabel(createdAt: string) {
    return formatDateDDMMYYYY(createdAt, true)
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

function Month3DSection({
    group,
    index,
}: {
    group: { month: string; posts: FeedPost[] }
    index: number
}) {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    })

    const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [16, 0, -10, -18])
    const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [90, 0, -20, -90])
    const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 0.98, 0.9])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.18, 1, 1, 0.12])

    return (
        <section ref={ref} className="relative min-h-[68vh] md:min-h-[85vh]">
            <motion.div
                style={{
                    rotateX,
                    y,
                    scale,
                    opacity,
                    transformPerspective: 1400,
                    transformOrigin: "center center",
                }}
                className="sticky top-20 md:top-24"
            >
                <div className="flex items-center gap-2 px-1 mb-4">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold text-white/90 tracking-wide">
                        {group.month}
                    </h2>
                    {index === 0 && (
                        <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] px-2 py-0.5 uppercase tracking-[0.12em]">
                            Current
                        </span>
                    )}
                </div>

                <div className="glass-card rounded-3xl p-4 md:p-5 border border-white/10">
                    <div className="flex flex-col md:flex-row gap-4 overflow-x-visible md:overflow-x-auto pb-2 md:snap-x md:snap-mandatory">
                        {group.posts.map((post) => (
                            <div key={post.id} className="w-full md:w-[360px] lg:w-[390px] md:snap-start md:shrink-0">
                                <BlogCard
                                    slug={post.slug}
                                    title={post.title}
                                    dateLabel={formatDateLabel(post.createdAt)}
                                    caption={post.caption}
                                    imageUrl={post.imageUrl}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default function HomeFeed({ posts }: { posts: FeedPost[] }) {
    const [query, setQuery] = useState("")

    const filteredPosts = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return posts
        return posts.filter((post) => {
            const haystack = `${post.title} ${post.caption || ""} ${post.content}`.toLowerCase()
            return haystack.includes(q)
        })
    }, [posts, query])

    const groupedPosts = useMemo(() => {
        const groups: { month: string; posts: FeedPost[] }[] = []
        for (const post of filteredPosts) {
            const month = formatMonthLabel(post.createdAt)
            const existing = groups.find((group) => group.month === month)
            if (existing) {
                existing.posts.push(post)
            } else {
                groups.push({ month, posts: [post] })
            }
        }
        return groups
    }, [filteredPosts])

    return (
        <>
            <section className="md:hidden mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-20 z-20 glass-card rounded-2xl p-3 border border-white/10"
                >
                    <label className="flex items-center gap-3 px-2 py-2">
                        <Search className="w-4 h-4 text-primary" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search posts..."
                            className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm"
                        />
                    </label>
                </motion.div>
            </section>

            <section className="md:hidden space-y-8">
                <AnimatePresence mode="popLayout">
                    {groupedPosts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="glass-card rounded-2xl p-8 text-center text-muted"
                        >
                            No posts match your search.
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <section className="space-y-8">
                {groupedPosts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-8 text-center text-muted hidden md:block"
                    >
                        No posts match your search.
                    </motion.div>
                )}
                {groupedPosts.map((group, index) => (
                    <Month3DSection
                        key={group.month}
                        group={group}
                        index={index}
                    />
                ))}
            </section>
        </>
    )
}
