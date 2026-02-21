"use client"

import { motion } from "framer-motion"

export default function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.main
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12"
        >
            {children}
        </motion.main>
    )
}
