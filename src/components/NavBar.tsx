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
        { name: "Archive", href: "/archive" },
        { name: "About Author", href: "/about" },
    ]

    useEffect(() => {
        const q = searchQuery.trim()
        if (q.length < 2) {
            setResults([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/posts?q=${encodeURIComponent(q)}`)
                const data = await res.json()
                setResults(data.results || [])
            } catch (error) {
                console.error("Search failed:", error)
                setResults([])
            } finally {
                setIsSearching(false)
            }
        }, 220)

        return () => clearTimeout(timer)
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center">
                <motion.div
                    animate={{ x: isSearchOpen ? -24 : 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                >
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        Nitya's <span className="text-primary">Blog</span>
                    </Link>
                </motion.div>
                <div
                    ref={searchWrapRef}
                    className="relative hidden sm:block ml-6"
                    onMouseEnter={() => setIsSearchOpen(true)}
                    onMouseLeave={() => {
                        if (!searchQuery.trim()) setIsSearchOpen(false)
                    }}
                >
                    <motion.div
                        animate={{
                            width: isSearchOpen ? 300 : 36,
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        className={`h-10 rounded-full flex items-center overflow-hidden ${isSearchOpen
                            ? "bg-white/5 border border-white/10"
                            : "bg-transparent border border-transparent"
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen((prev) => !prev)}
                            className="w-9 h-9 flex items-center justify-center text-primary shrink-0"
                            aria-label="Search blog posts"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                        <motion.div
                            animate={{
                                width: isSearchOpen ? "100%" : 0,
                                opacity: isSearchOpen ? 1 : 0,
                            }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                        >
                            <input
                                value={searchQuery}
                                onFocus={() => setIsSearchOpen(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search blogs..."
                                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none pr-3"
                            />
                        </motion.div>
                    </motion.div>

                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-12 left-0 w-full rounded-2xl p-2.5 border border-white/15 bg-[#090b10] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                        >
                            {searchQuery.trim().length < 2 ? (
                                <p className="text-xs text-muted px-2 py-3">Type at least 2 characters to search posts.</p>
                            ) : isSearching ? (
                                <p className="text-xs text-muted px-2 py-3">Searching...</p>
                            ) : results.length === 0 ? (
                                <p className="text-xs text-muted px-2 py-3">No matching posts found.</p>
                            ) : (
                                <div className="space-y-1">
                                    {results.map((result) => (
                                        <Link
                                            key={result.id}
                                            href={`/blog/${result.slug}`}
                                            className="block p-3 rounded-xl bg-[#11151f] hover:bg-[#171c29] transition-colors border border-white/5"
                                        >
                                            <p className="text-sm text-white font-semibold">{result.title}</p>
                                            <p className="text-xs text-neutral-300 mt-1 line-clamp-2">{result.excerpt}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                <motion.nav
                    className="flex items-center space-x-6 ml-6"
                    animate={{ x: isSearchOpen ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
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
        </motion.header>
    )
}
