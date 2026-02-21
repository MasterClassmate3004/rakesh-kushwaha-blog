"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center text-red-400 hover:text-red-300 px-3 py-2 w-full transition-colors rounded-lg hover:bg-red-500/10 text-left"
        >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
        </button>
    )
}
