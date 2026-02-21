import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isAdminRoute = nextUrl.pathname.startsWith("/admin")
            const isLoginRoute = nextUrl.pathname.startsWith("/login")

            if (isAdminRoute && !isLoggedIn) {
                return false
            }

            if (isLoginRoute && isLoggedIn) {
                return Response.redirect(new URL("/admin", nextUrl))
            }

            return true
        },
    },
    providers: [], // Add empty providers to satisfy Type
} satisfies NextAuthConfig
