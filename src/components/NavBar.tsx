"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type SearchResult = {
    id: string
    slug: string
    title: string
    excerpt: string
    createdAt: string
}

export default function NavBar() {
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const searchWrapRef = useRef<HTMLDivElement>(null)

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "About Author", href: "/about" },
    ]

    useEffect(() => {
        const q = searchQuery.trim()
        if (q.length < 2) {
            setResults([])
            setIsSearching(false)
            return
        }

        const controller = new AbortController()
        setIsSearching(true)
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/posts?q=${encodeURIComponent(q)}`, {
                    signal: controller.signal,
                    cache: "no-store",
                })
                if (!res.ok) {
                    setResults([])
                    return
                }
                const data = await res.json()
                setResults(data.results || [])
            } catch (error) {
                if ((error as any)?.name !== "AbortError") {
                    console.error("Search failed:", error)
                    setResults([])
                }
            } finally {
                setIsSearching(false)
            }
        }, 220)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [searchQuery])

    useEffect(() => {
        setIsSearchOpen(false)
        setSearchQuery("")
        setResults([])
    }, [pathname])

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (!searchWrapRef.current) return
            if (!searchWrapRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false)
            }
        }
        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [])

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 glass"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="h-20 flex items-center justify-between md:hidden">
                    <Link href="/" className="flex items-center gap-2 shrink-0 pl-1">
                        <img src="/logo.png" alt="Mathivation Research Lab" className="h-16 w-auto object-contain mix-blend-screen scale-[1.75] origin-left pointer-events-none" />
                    </Link>

                    <div className="md:hidden flex items-center gap-2">
                        {status === "authenticated" ? (
                            <>
                                <Link href="/profile" className="text-xs text-muted hover:text-white px-2 py-1 rounded-lg border border-white/10">
                                    Profile
                                </Link>
                                {(session?.user as any)?.role === "ADMIN" && (
                                    <Link href="/admin" className="text-xs text-muted hover:text-white px-2 py-1 rounded-lg border border-white/10">
                                        Admin
                                    </Link>
                                )}
                            </>
                        ) : (
                            <Link href="/login" className="text-xs text-muted hover:text-white px-2 py-1 rounded-lg border border-white/10">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                <div className="md:hidden pb-2 -mx-1 px-1 overflow-x-auto no-scrollbar">
                    <nav className="flex items-center gap-2 min-w-max">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                            return (
                                <Link
                                    key={`m-${link.name}`}
                                    href={link.href}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${isActive
                                        ? "text-white border-primary/60 bg-primary/15"
                                        : "text-muted border-white/10 hover:text-white hover:border-white/20"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="hidden md:flex h-24 items-center justify-between flex-1">
                    <motion.div>
                        <Link href="/" className="flex items-center shrink-0 pl-3 py-3">
                            <img src="/logo.png" alt="Mathivation Research Lab" className="h-24 w-auto object-contain mix-blend-screen scale-[2.25] origin-left pointer-events-none" />
                        </Link>
                    </motion.div>

                    <motion.nav
                        className="flex items-center space-x-6 ml-auto"
                    >

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
                    </motion.nav>
                </div>
            </div>
        </motion.header>
    )
}
