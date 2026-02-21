"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface BlogCardProps {
    id: string
    slug: string
    title: string
    date: Date
    excerpt: string
    imageUrl?: string | null
}

export default function BlogCard({ id, slug, title, date, excerpt, imageUrl }: BlogCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
        >
            <Link href={`/blog/${slug}`} className="block h-full">
                {imageUrl && (
                    <div className="w-full h-48 overflow-hidden bg-white/5">
                        <motion.img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="p-6">
                    <p className="text-sm text-primary mb-2 font-medium tracking-wide">
                        {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date))}
                    </p>
                    <h2 className="text-2xl font-bold mb-3 liquid-text">
                        {title}
                    </h2>
                    <p className="text-muted line-clamp-3">
                        {excerpt}
                    </p>
                </div>
            </Link>
        </motion.div>
    )
}
