"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useSession, signOut } from "next-auth/react"

export default function NavBar() {
    const pathname = usePathname()
    const { data: session, status } = useSession()

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About Author", href: "/about" },
    ]

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 glass"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Nitya's <span className="text-primary">Blog</span>
                </Link>
                <nav className="flex items-center space-x-6">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative px-1 py-2 text-sm font-medium transition-colors hover:text-white ${isActive ? "text-white" : "text-muted"}`}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        )
                    })}

                    {/* Authenticated Links */}
                    {status === "authenticated" && (
                        <>
                            <Link
                                href="/profile"
                                className={`relative px-1 py-2 text-sm font-medium transition-colors hover:text-white ${pathname === "/profile" ? "text-white" : "text-muted"}`}
                            >
                                Profile
                                {pathname === "/profile" && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                            {(session?.user as any)?.role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    className={`relative px-1 py-2 text-sm font-medium transition-colors hover:text-white ${pathname.startsWith("/admin") ? "text-white" : "text-muted"}`}
                                >
                                    Dashboard
                                    {pathname.startsWith("/admin") && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            )}
                        </>
                    )}

                    {/* Guest Links */}
                    {status === "unauthenticated" && (
                        <div className="flex items-center space-x-4 border-l border-white/10 pl-6 ml-2">
                            <Link
                                href="/login"
                                className={`relative px-1 py-2 text-sm font-medium transition-colors hover:text-white ${pathname === "/login" ? "text-white" : "text-muted"}`}
                            >
                                Login
                                {pathname === "/login" && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                            <Link
                                href="/register"
                                className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all shadow-lg shadow-primary/20"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </motion.header>
    )
}
