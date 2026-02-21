"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface BlogCardProps {
    slug: string
    title: string
    dateLabel: string
    caption?: string | null
    imageUrl?: string | null
}

export default function BlogCard({ slug, title, dateLabel, caption, imageUrl }: BlogCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 22, rotateX: 10, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ transformPerspective: 1200, transformOrigin: "center top" }}
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
                    <p className="text-sm text-sky-300 mb-2 font-medium tracking-wide">
                        {dateLabel}
                    </p>
                    <h2 className="text-2xl font-bold mb-3 liquid-text">
                        {title}
                    </h2>
                    {caption && (
                        <p className="text-muted line-clamp-3">
                            {caption}
                        </p>
                    )}
                </div>
            </Link>
        </motion.div>
    )
}
