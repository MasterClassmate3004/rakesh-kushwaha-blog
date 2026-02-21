"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ALLOWED_IMAGE_MIME = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
])

export async function updateProfileImage(imageUrl: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    if (!imageUrl || imageUrl.length > 3_000_000) {
        throw new Error("Invalid image data")
    }

    if (imageUrl.startsWith("data:")) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
        if (!match) throw new Error("Invalid image format")

        const mimeType = match[1].toLowerCase()
        const encoded = match[2]
        if (!ALLOWED_IMAGE_MIME.has(mimeType)) {
            throw new Error("Unsupported image type")
        }

        // Convert base64 size to approximate bytes.
        const approxBytes = Math.floor((encoded.length * 3) / 4)
        if (approxBytes > MAX_IMAGE_BYTES) {
            throw new Error("Image is too large")
        }
    } else if (!/^https:\/\//i.test(imageUrl)) {
        throw new Error("Only HTTPS image URLs are allowed")
    }

    console.log(`Updating profile image for user ${session.user.email} (Length: ${imageUrl.length})`)

    await prisma.user.update({
        where: { id: (session.user as any).id },
        data: { image: imageUrl } as any
    })

    revalidatePath("/profile")
    revalidatePath("/", "layout")
}
