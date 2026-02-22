"use client"

import { motion } from "framer-motion"

export default function LandingHero3D() {
    return (
        <section className="relative h-[170px] md:h-[210px] mt-1 md:mt-2 mb-1 md:mb-2">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-20 md:top-24 left-0 right-0 z-40 pointer-events-none"
            >
                <div className="hero-overlay max-w-4xl mx-auto px-4 sm:px-6 pt-1 pb-3 md:pb-4 flex flex-col items-center text-center space-y-2 md:space-y-3">
                    <h1 className="hero-title text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent py-2">
                        Thoughts & Ideas
                    </h1>
                    <p className="text-muted max-w-2xl text-base md:text-lg">
                        Exploring software engineering, design patterns, and building premium user experiences.
                    </p>
                </div>
            </motion.div>
        </section>
    )
}
