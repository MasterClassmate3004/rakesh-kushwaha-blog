"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateProfileImage(imageUrl: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    console.log(`Updating profile image for user ${session.user.email} (Length: ${imageUrl.length})`)

    await prisma.user.update({
        where: { id: (session.user as any).id },
        data: { image: imageUrl } as any
    })

    revalidatePath("/profile")
    revalidatePath("/", "layout")
}
