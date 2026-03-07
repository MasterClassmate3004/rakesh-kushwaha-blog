import PageTransition from "@/components/PageTransition"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/ProfileForm"
import { prisma } from "@/lib/prisma"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Fetch the latest user data from the database to avoid stale session data
    let dbUser = null
    try {
        dbUser = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        })
    } catch (error) {
        console.error("Profile page database connection failed:", error)
    }

    if (!dbUser) {
        redirect("/login")
    }

    const user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: (dbUser as any).image
    }

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
                <div className="w-full max-w-md">
                    <ProfileForm user={user} />
                </div>
            </div>
        </PageTransition>
    )
}
