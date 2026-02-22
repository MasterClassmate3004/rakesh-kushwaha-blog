"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError("Invalid email or password.")
            setLoading(false)
        } else {
            // Check the session to see if we're an admin
            const response = await fetch('/api/auth/session')
            const session = await response.json()

            if (session?.user?.role === 'ADMIN') {
                window.location.href = "/admin"
            } else {
                window.location.href = "/"
            }
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center -mt-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="glass-card max-w-sm w-full p-8 rounded-[2rem] text-center"
            >
                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
                <p className="text-muted text-sm mb-8">Sign in to your account</p>

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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="auth-input w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="auth-input w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                        {loading ? "Signing in..." : "Sign In"}
                    </motion.button>
                </form>

                <p className="mt-6 text-sm text-muted">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                        Register
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
