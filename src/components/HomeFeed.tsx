"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
    updatedAt?: string
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

export default function HomeFeed({ posts }: { posts: FeedPost[] }) {
    const [query, setQuery] = useState("")
    const [activeIndex, setActiveIndex] = useState(0)
    const [direction, setDirection] = useState(1)
    const wheelLockRef = useRef(false)

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
        return groups.map((group) => ({
            ...group,
            posts: [...group.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        }))
    }, [filteredPosts])

    const safeActiveIndex = Math.min(activeIndex, Math.max(0, groupedPosts.length - 1))
    const activeGroup = groupedPosts[safeActiveIndex]

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflowY
        const previousHtmlOverflow = document.documentElement.style.overflowY
        document.body.style.overflowY = "hidden"
        document.documentElement.style.overflowY = "hidden"

        const onWheel = (event: WheelEvent) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
            event.preventDefault()

            if (groupedPosts.length <= 1) return
            if (wheelLockRef.current) return
            if (Math.abs(event.deltaY) < 10) return

            wheelLockRef.current = true
            window.setTimeout(() => {
                wheelLockRef.current = false
            }, 320)

            const nextDirection: 1 | -1 = event.deltaY > 0 ? -1 : 1
            setDirection(nextDirection)
            if (event.deltaY > 0) {
                setActiveIndex((prev) => Math.min(prev + 1, groupedPosts.length - 1))
            } else {
                setActiveIndex((prev) => Math.max(prev - 1, 0))
            }
        }

        window.addEventListener("wheel", onWheel, { passive: false })

        return () => {
            window.removeEventListener("wheel", onWheel)
            document.body.style.overflowY = previousBodyOverflow
            document.documentElement.style.overflowY = previousHtmlOverflow
        }
    }, [groupedPosts.length])

    return (
        <>
            <section className="md:hidden mb-4">
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

            {groupedPosts.length === 0 ? (
                <AnimatePresence mode="popLayout">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="glass-card rounded-2xl p-8 text-center text-muted"
                    >
                        No posts match your search.
                    </motion.div>
                </AnimatePresence>
            ) : (
                <section className="relative">
                    <div className="relative h-[49vh] min-h-[420px]">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={activeGroup.month}
                                initial={{ opacity: 0, x: direction > 0 ? 240 : -240 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction > 0 ? -240 : 240 }}
                                transition={{ type: "spring", stiffness: 120, damping: 26, mass: 1.15 }}
                                className="absolute inset-0 space-y-4"
                            >
                                <div className="flex items-center gap-2 px-1">
                                    <CalendarDays className="w-4 h-4 text-primary" />
                                    <h2 className="text-base font-semibold text-white/90 tracking-wide">
                                        {activeGroup.month}
                                    </h2>
                                    {safeActiveIndex === 0 && (
                                        <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] px-2 py-0.5 uppercase tracking-[0.12em]">
                                            Current
                                        </span>
                                    )}
                                </div>

                                <div className="glass-card rounded-3xl p-5 md:p-6 border border-white/10">
                                    <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-3 month-scrollbar snap-x snap-mandatory">
                                        {activeGroup.posts.map((post) => (
                                            <div key={post.id} className="w-[320px] sm:w-[360px] lg:w-[390px] shrink-0 snap-start">
                                                <BlogCard
                                                    slug={post.slug}
                                                    title={post.title}
                                                    dateLabel={formatDateLabel(post.createdAt)}
                                                    caption={post.caption}
                                                    imageUrl={post.imageUrl}
                                                    imageVersion={post.updatedAt}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {activeGroup.posts.length > 1 && (
                                        <p className="text-[11px] text-white/45 mt-2 px-1">
                                            Scroll sideways to view all posts in this month.
                                        </p>
                                    )}
                                    <p className="text-[11px] text-white/45 mt-1 px-1">
                                        Scroll vertically to switch months.
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        <div className="pointer-events-none absolute top-2 right-2 text-[11px] text-white/45">
                            {safeActiveIndex + 1} / {groupedPosts.length}
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}
