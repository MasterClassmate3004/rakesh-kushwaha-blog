"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, Check } from "lucide-react"

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        try {
            const consent = localStorage.getItem("cookie-consent")
            if (!consent) {
                const timer = setTimeout(() => {
                    setIsVisible(true)
                }, 1000) // Reduced to 1s for better UX/testing
                return () => clearTimeout(timer)
            }
        } catch (e) {
            console.error("CookieConsent error:", e)
        }
    }, [])

    if (!mounted) return null

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted")
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[9999]"
                >
                    <div className="glass-card p-6 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden bg-black/80 backdrop-blur-2xl">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                        <div className="flex gap-4 items-start text-left">
                            <div className="bg-primary/10 p-3 rounded-2xl h-fit">
                                <Cookie className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white font-bold text-lg leading-none">Privacy & Cookies</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    We use essential cookies to ensure the best experience on our site. No telemetry or tracking is performed.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleAccept}
                                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <Check className="w-4 h-4" /> Accept All
                                    </button>
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="text-neutral-400 hover:text-white px-4 py-2.5 text-sm font-medium transition-colors"
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
