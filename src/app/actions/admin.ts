"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sanitizeHtml } from "@/lib/sanitize"

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ALLOWED_IMAGE_MIME = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
])

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

export async function savePost(data: { id?: string, title: string, caption?: string, content: string, imageUrl?: string | null, published: boolean, scheduleAt?: string }) {
    await requireAdmin()

    const baseSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    if (!baseSlug) {
        throw new Error("Title is required")
    }

    const sanitizedContent = sanitizeHtml(data.content || "")
    const normalizedCaption = data.caption?.trim() || null
    const normalizedScheduleAt = data.scheduleAt?.trim()
    let createdAtForPost: Date | undefined
    let publishAtForPost: Date | null | undefined

    if (normalizedScheduleAt) {
        const parsed = new Date(normalizedScheduleAt)
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("Invalid publish date/time")
        }
        createdAtForPost = parsed
        publishAtForPost = parsed
    } else {
        publishAtForPost = null
    }

    const normalizedImageUrl = data.imageUrl?.trim() || ""

    if (normalizedImageUrl) {
        if (normalizedImageUrl.startsWith("data:")) {
            const match = normalizedImageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
            if (!match) throw new Error("Invalid image format")

            const mimeType = match[1].toLowerCase()
            const encoded = match[2]
            if (!ALLOWED_IMAGE_MIME.has(mimeType)) {
                throw new Error("Unsupported image type")
            }

            const approxBytes = Math.floor((encoded.length * 3) / 4)
            if (approxBytes > MAX_IMAGE_BYTES) {
                throw new Error("Image is too large")
            }
        } else if (!/^https:\/\//i.test(normalizedImageUrl)) {
            throw new Error("Only HTTPS image URLs are allowed")
        }
    } else if (data.published) {
        throw new Error("Cover image is required to publish")
    }

    const imageUrlForPost = normalizedImageUrl || null

    let slug = baseSlug
    let suffix = 1
    while (true) {
        const existing = await prisma.post.findUnique({ where: { slug } })
        if (!existing || existing.id === data.id) break
        suffix += 1
        slug = `${baseSlug}-${suffix}`
    }

    const post = await prisma.post.upsert({
        where: { id: data.id || "new" },
        update: {
            title: data.title,
            caption: normalizedCaption,
            slug,
            content: sanitizedContent,
            imageUrl: imageUrlForPost,
            published: data.published,
            publishAt: publishAtForPost,
            ...(createdAtForPost ? { createdAt: createdAtForPost } : {}),
        } as any,
        create: {
            title: data.title,
            caption: normalizedCaption,
            slug,
            content: sanitizedContent,
            imageUrl: imageUrlForPost,
            published: data.published,
            publishAt: publishAtForPost,
            ...(createdAtForPost ? { createdAt: createdAtForPost } : {}),
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
