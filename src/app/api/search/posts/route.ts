import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
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
                            { caption: { contains: q, mode: "insensitive" } },
                        ],
                    },
                ],
            } as any,
            select: {
                id: true,
                slug: true,
                title: true,
                caption: true,
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
            excerpt: (post.caption || post.title).slice(0, 120),
        }))

        return NextResponse.json({ results })
    } catch (error) {
        console.error("Search API failed:", error)
        return NextResponse.json({ results: [] }, { status: 200 })
    }
}
