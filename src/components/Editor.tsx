"use client"

import { useState } from "react"
import { savePost } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

interface EditorProps {
    initialData?: {
        id?: string
        title: string
        content: string
        imageUrl?: string | null
        published: boolean
    }
}

export default function Editor({ initialData }: EditorProps) {
    const router = useRouter()
    const [title, setTitle] = useState(initialData?.title || "")
    const [content, setContent] = useState(initialData?.content || "")
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")
    const [published, setPublished] = useState(initialData?.published || false)
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        await savePost({
            id: initialData?.id,
            title,
            content,
            imageUrl: imageUrl || undefined,
            published
        })

        router.push("/admin")
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="glass-card p-8 rounded-3xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Post Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-xl font-bold transition-all"
                        placeholder="An amazing title..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Cover Image URL (Optional)</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Content (HTML allowed)</label>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[400px] font-mono text-sm transition-all resize-y"
                        placeholder="<p>Write your amazing blog post here...</p>"
                    />
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                    <input
                        type="checkbox"
                        id="published"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 text-primary focus:ring-primary bg-black/40"
                    />
                    <label htmlFor="published" className="text-white font-medium cursor-pointer">
                        Publish this post immediately
                    </label>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? "Saving..." : "Save Post"}
                </button>
            </div>
        </form>
    )
}
