import Editor from "@/components/Editor"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let post = null
    try {
        post = await prisma.post.findUnique({
            where: { id: params.id }
        })
    } catch (error) {
        console.error("Edit page database connection failed:", error)
    }

    if (!post) {
        notFound()
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Edit Post</h1>
                <p className="text-muted">Refine your draft with live preview, outline navigation, and quick formatting tools.</p>
            </div>
            <Editor initialData={post} />
        </div>
    )
}
