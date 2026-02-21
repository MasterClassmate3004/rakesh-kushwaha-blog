import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { LayoutDashboard, PenTool, CheckSquare } from "lucide-react"
import SignOutButton from "@/components/SignOutButton"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="flex-1 flex max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 gap-8">
            <aside className="w-64 flex-shrink-0">
                <div className="glass-card rounded-2xl p-6 sticky top-24">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold tracking-tight text-white mb-1">Admin Panel</h2>
                        <p className="text-sm text-primary">Logged in as {(session.user as any).name}</p>
                    </div>

                    <nav className="space-y-2">
                        <Link href="/admin" className="flex items-center text-neutral-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                            <LayoutDashboard className="w-4 h-4 mr-3" />
                            Overview
                        </Link>
                        <Link href="/admin/new" className="flex items-center text-neutral-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                            <PenTool className="w-4 h-4 mr-3" />
                            Write Post
                        </Link>
                        <Link href="/admin/comments" className="flex items-center text-neutral-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                            <CheckSquare className="w-4 h-4 mr-3" />
                            Comments
                        </Link>
                    </nav>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <SignOutButton />
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    )
}
