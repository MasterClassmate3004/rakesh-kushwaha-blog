"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
    const session = await auth()
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized")
    }
}

export async function updateCommentStatus(commentId: string, status: "APPROVED" | "REJECTED") {
    await requireAdmin()

    await prisma.comment.update({
        where: { id: commentId },
        data: { status }
    })

    revalidatePath("/admin/comments")
    revalidatePath("/") // revalidate everywhere just in case
}

export async function savePost(data: { id?: string, title: string, content: string, imageUrl?: string, published: boolean }) {
    await requireAdmin()

    const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    const post = await prisma.post.upsert({
        where: { id: data.id || "new" },
        update: {
            title: data.title,
            slug,
            content: data.content,
            imageUrl: data.imageUrl,
            published: data.published
        } as any,
        create: {
            title: data.title,
            slug,
            content: data.content,
            imageUrl: data.imageUrl,
            published: data.published
        } as any
    })

    revalidatePath("/admin")
    revalidatePath("/")
    return post.id
}

export async function deletePost(id: string) {
    try {
        await requireAdmin()
        console.log(`Deleting post with id: ${id}`)
        await prisma.post.delete({
            where: { id }
        })
        console.log(`Successfully deleted post: ${id}`)
        revalidatePath("/admin")
        revalidatePath("/")
    } catch (error: any) {
        console.error("Delete action failed:", error.message)
        throw error
    }
}
