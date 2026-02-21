"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addComment(postId: string, text: string) {
    const session = await auth()

    if (!session?.user?.email) {
        return { error: "You must be logged in to comment." }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return { error: "User not found." }
    }

    await prisma.comment.create({
        data: {
            text,
            postId,
            authorId: user.id,
            status: "PENDING"
        }
    })

    revalidatePath(`/blog/${postId}`)
    return { success: true }
}
