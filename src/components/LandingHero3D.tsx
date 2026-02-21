"use client"

import { motion, useScroll, useTransform } from "framer-motion"

export default function LandingHero3D() {
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 320], [0, 60])
    const rotateX = useTransform(scrollY, [0, 320], [0, 8])
    const opacity = useTransform(scrollY, [0, 260], [1, 0.72])

    return (
        <motion.section
            style={{
                y,
                rotateX,
                opacity,
                transformPerspective: 1100,
                transformOrigin: "center top",
            }}
            className="flex flex-col items-center mb-16 mt-8 text-center space-y-4"
        >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 py-2">
                Thoughts & Ideas
            </h1>
            <p className="text-muted max-w-2xl text-lg">
                Exploring software engineering, design patterns, and building premium user experiences.
            </p>
        </motion.section>
    )
}

