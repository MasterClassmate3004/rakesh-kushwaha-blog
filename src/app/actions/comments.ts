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

    const trimmed = text.trim()
    if (trimmed.length < 2) {
        return { error: "Comment is too short." }
    }
    if (trimmed.length > 2000) {
        return { error: "Comment is too long." }
    }

    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            published: true,
            OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
        } as any,
        select: { slug: true }
    })

    if (!post) {
        return { error: "Post not found." }
    }

    await prisma.comment.create({
        data: {
            text: trimmed,
            postId,
            authorId: user.id,
            status: "PENDING"
        }
    })

    revalidatePath(`/blog/${post.slug}`)
    return { success: true }
}

export async function addAuthorReply(commentId: string, text: string) {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { error: "Only the author can reply." }
    }

    const trimmed = text.trim()
    if (trimmed.length < 2) {
        return { error: "Reply is too short." }
    }
    if (trimmed.length > 2000) {
        return { error: "Reply is too long." }
    }

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { id: true }
    })
    if (!user) {
        return { error: "Author not found." }
    }

    const parent = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, postId: true, post: { select: { slug: true } } }
    })
    if (!parent) {
        return { error: "Comment not found." }
    }

    await prisma.comment.create({
        data: {
            text: trimmed,
            postId: parent.postId,
            authorId: user.id,
            status: "APPROVED",
            parentId: parent.id,
        }
    })

    revalidatePath(`/blog/${parent.post.slug}`)
    return { success: true }
}
