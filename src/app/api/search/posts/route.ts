import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()

    if (q.length < 2) {
        return NextResponse.json({ results: [] })
    }

    const now = new Date()
    const posts = await prisma.post.findMany({
        where: {
            published: true,
            AND: [
                { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
                {
                    OR: [
                        { title: { contains: q, mode: "insensitive" } },
                        { content: { contains: q, mode: "insensitive" } },
                    ],
                },
            ],
        } as any,
        select: {
            id: true,
            slug: true,
            title: true,
            caption: true,
            content: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
    })

    const results = posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        createdAt: post.createdAt,
        excerpt: (post.caption || post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 120),
    }))

    return NextResponse.json({ results })
}
