import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

// We initialize NextAuth with the config that DOES NOT contain bcrypt or prisma
// this is the only way to satisfy Vercel Edge Runtime limits
const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const isAdminRoute = nextUrl.pathname.startsWith("/admin")
    const isLoginRoute = nextUrl.pathname.startsWith("/login")

    if (isAdminRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    if (isLoginRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/admin", nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
