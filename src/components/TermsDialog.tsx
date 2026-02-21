"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, X, FileText } from "lucide-react"

interface TermsDialogProps {
    isOpen: boolean
    onAccept: () => void
    onCancel: () => void
    loading?: boolean
}

export default function TermsDialog({ isOpen, onAccept, onCancel, loading }: TermsDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-black border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-gradient-to-r from-primary/10 to-transparent">
                            <div className="bg-primary/20 p-3 rounded-2xl">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-white tracking-tight">Terms & Privacy Policy</h2>
                                <p className="text-neutral-400 text-sm">Please review before continuing</p>
                            </div>
                            <button
                                onClick={onCancel}
                                className="ml-auto p-2 text-neutral-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-neutral-300 leading-relaxed custom-scrollbar">
                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    1. Data Usage & Storage
                                </h3>
                                <p>
                                    To provide a personalized experience, we store your name, email address, and profile picture. Your encrypted password is used solely for authentication and is never stored in plain text.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    2. Security & Account
                                </h3>
                                <p>
                                    You are responsible for maintaining the confidentiality of your account. We implement industry-standard security measures to protect your data, but no system is 100% secure.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    3. Content & Comments
                                </h3>
                                <p>
                                    By posting comments or content, you grant us a non-exclusive license to display and moderate that content on this platform. Respectful behavior is mandatory.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    4. Cookie Usage
                                </h3>
                                <p>
                                    We use essential cookies to keep you logged in and functional cookies to improve site performance. You can manage your preferences at any time.
                                </p>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-neutral-900/50 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onAccept}
                                disabled={loading}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? "Creating Account..." : "I Accept All Terms"}
                            </button>
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="px-8 py-4 text-neutral-400 hover:text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
