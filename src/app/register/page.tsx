"use client"

import { useState, useRef } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { register } from "@/app/actions/auth"
import Link from "next/link"
import TermsDialog from "@/components/TermsDialog"

export default function RegisterPage() {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [isTermsOpen, setIsTermsOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const handlePreSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsTermsOpen(true)
    }

    const handleAcceptTerms = async () => {
        if (!formRef.current) return

        setIsTermsOpen(false)
        setLoading(true)
        setError("")

        const formData = new FormData(formRef.current)
        const password = formData.get("password") as string
        const result = await register(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            // Auto-login after registration
            const loginResult = await signIn("credentials", {
                email: result.email,
                password,
                redirect: false
            })

            if (loginResult?.error) {
                window.location.href = "/login"
            } else {
                window.location.href = "/"
            }
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center -mt-16">
            <TermsDialog
                isOpen={isTermsOpen}
                onAccept={handleAcceptTerms}
                onCancel={() => setIsTermsOpen(false)}
                loading={loading}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="glass-card max-w-sm w-full p-8 rounded-[2rem] text-center"
            >
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
                <p className="text-muted text-sm mb-8">Join our community</p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0, x: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                        className="bg-red-500/10 text-red-500 text-sm p-3 rounded-xl mb-6 border border-red-500/20 font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <form ref={formRef} onSubmit={handlePreSubmit} className="space-y-4">
                    <div>
                        <input
                            name="name"
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email address"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-primary text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        type="submit"
                    >
                        {loading ? "Processing..." : "Register"}
                    </motion.button>
                </form>

                <p className="mt-6 text-sm text-muted">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
