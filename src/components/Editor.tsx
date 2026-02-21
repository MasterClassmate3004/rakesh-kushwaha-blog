"use client"

import { useRef, useState } from "react"
import { savePost } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { Heading2, Heading3, List, ListOrdered, Pilcrow, Quote, RemoveFormatting, SeparatorHorizontal, Type, Upload, X } from "lucide-react"

interface EditorProps {
    initialData?: {
        id?: string
        title: string
        caption?: string | null
        content: string
        imageUrl?: string | null
        createdAt?: string | Date | null
        publishAt?: string | Date | null
    }
}

function toInputDateTimeLocal(value?: string | Date | null) {
    if (!value) return ""
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const h = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    return `${y}-${m}-${day}T${h}:${min}`
}

export default function Editor({ initialData }: EditorProps) {
    const router = useRouter()
    const [title, setTitle] = useState(initialData?.title || "")
    const [caption, setCaption] = useState(initialData?.caption || "")
    const [content, setContent] = useState(initialData?.content || "")
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")
    const [publishAt, setPublishAt] = useState(
        toInputDateTimeLocal(initialData?.publishAt) || toInputDateTimeLocal(initialData?.createdAt) || toInputDateTimeLocal(new Date())
    )
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const publishAtRef = useRef<HTMLInputElement>(null)

    const insertAtCursor = (snippet: string) => {
        const textarea = textAreaRef.current
        if (!textarea) {
            setContent((prev) => `${prev}${snippet}`)
            return
        }

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = content.slice(0, start)
        const selected = content.slice(start, end)
        const after = content.slice(end)
        const next = `${before}${snippet}${selected}${after}`
        setContent(next)

        requestAnimationFrame(() => {
            textarea.focus()
            const cursor = start + snippet.length
            textarea.setSelectionRange(cursor, cursor)
        })
    }

    const wrapSelection = (openTag: string, closeTag: string, fallbackText: string) => {
        const textarea = textAreaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = content.slice(0, start)
        const selected = content.slice(start, end) || fallbackText
        const after = content.slice(end)
        const next = `${before}${openTag}${selected}${closeTag}${after}`
        setContent(next)

        requestAnimationFrame(() => {
            textarea.focus()
            const selStart = start + openTag.length
            const selEnd = selStart + selected.length
            textarea.setSelectionRange(selStart, selEnd)
        })
    }

    const applyPreset = (preset: "heading" | "subheading" | "body" | "quote" | "callout" | "ul" | "ol" | "serif" | "mono" | "blue" | "muted") => {
        const map = {
            heading: () => wrapSelection('<h2 class="post-heading">', "</h2>", "Section Heading"),
            subheading: () => wrapSelection('<h3 class="post-subheading">', "</h3>", "Subheading"),
            body: () => wrapSelection('<p class="post-body">', "</p>", "Write your paragraph here."),
            quote: () => wrapSelection('<blockquote class="post-quote">', "</blockquote>", "A meaningful quote."),
            callout: () => wrapSelection('<div class="post-callout"><p class="post-body">', "</p></div>", "Helpful tip or important note."),
            ul: () => insertAtCursor('\n<ul class="post-list">\n  <li>First point</li>\n  <li>Second point</li>\n</ul>\n'),
            ol: () => insertAtCursor('\n<ol class="post-list-ordered">\n  <li>Step one</li>\n  <li>Step two</li>\n</ol>\n'),
            serif: () => wrapSelection('<span class="post-font-serif">', "</span>", "Serif highlight"),
            mono: () => wrapSelection('<span class="post-font-mono">', "</span>", "inline-code"),
            blue: () => wrapSelection('<span class="post-color-blue">', "</span>", "accent text"),
            muted: () => wrapSelection('<span class="post-color-muted">', "</span>", "secondary text"),
        }
        map[preset]()
    }

    const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            alert("Image must be under 2MB.")
            return
        }

        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setImageUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageUrl.trim()) {
            alert("Cover image is required.")
            return
        }
        setIsSaving(true)

        await savePost({
            id: initialData?.id,
            title,
            caption: caption || undefined,
            content,
            imageUrl: imageUrl || undefined,
            published: true,
            scheduleAt: publishAt || undefined,
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
                    <label className="block text-sm font-medium text-muted mb-2">Caption</label>
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="One-line summary shown on cards and search results..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Publish Date & Time</label>
                    <input
                        ref={publishAtRef}
                        type="datetime-local"
                        required
                        value={publishAt}
                        onChange={(e) => setPublishAt(e.target.value)}
                        onFocus={() => publishAtRef.current?.showPicker?.()}
                        className="w-full sm:w-96 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <p className="text-xs text-muted/90 mt-2">
                        Set past dates for backdated posts, or future dates to schedule auto-publishing.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Cover Image (Required)</label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageFile}
                        className="hidden"
                    />
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white hover:bg-black/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Image from Computer
                        </button>
                        {imageUrl && (
                            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                <img src={imageUrl} alt="Cover preview" className="w-full h-48 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageUrl("")
                                        if (fileInputRef.current) fileInputRef.current.value = ""
                                    }}
                                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    {!imageUrl && (
                        <p className="text-xs text-amber-300 mt-2">Please upload a cover image before publishing.</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Content (HTML allowed)</label>
                    <p className="text-xs text-muted/90 mb-2">
                        Safe HTML tags are allowed. Use the preset toolbar for consistent Apple-style formatting. Unsafe tags/attributes are removed automatically.
                    </p>
                    <div className="glass-card rounded-2xl p-3 mb-3 border border-white/10">
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => applyPreset("heading")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Heading2 className="w-3.5 h-3.5" /> Heading
                            </button>
                            <button type="button" onClick={() => applyPreset("subheading")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Heading3 className="w-3.5 h-3.5" /> Subheading
                            </button>
                            <button type="button" onClick={() => applyPreset("body")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Pilcrow className="w-3.5 h-3.5" /> Paragraph
                            </button>
                            <button type="button" onClick={() => applyPreset("quote")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Quote className="w-3.5 h-3.5" /> Quote
                            </button>
                            <button type="button" onClick={() => applyPreset("ul")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <List className="w-3.5 h-3.5" /> Bullets
                            </button>
                            <button type="button" onClick={() => applyPreset("ol")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <ListOrdered className="w-3.5 h-3.5" /> Numbered
                            </button>
                            <button type="button" onClick={() => applyPreset("callout")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Type className="w-3.5 h-3.5" /> Callout
                            </button>
                            <button type="button" onClick={() => insertAtCursor("\n<hr class=\"post-divider\" />\n")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <SeparatorHorizontal className="w-3.5 h-3.5" /> HR
                            </button>
                            <button type="button" onClick={() => insertAtCursor("<br />")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <RemoveFormatting className="w-3.5 h-3.5" /> BR
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/10">
                            <button type="button" onClick={() => applyPreset("serif")} className="px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25">
                                Serif
                            </button>
                            <button type="button" onClick={() => applyPreset("mono")} className="px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25">
                                Mono
                            </button>
                            <button type="button" onClick={() => applyPreset("blue")} className="px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25">
                                Accent Blue
                            </button>
                            <button type="button" onClick={() => applyPreset("muted")} className="px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25">
                                Muted
                            </button>
                        </div>
                    </div>
                    <textarea
                        ref={textAreaRef}
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[400px] font-mono text-sm transition-all resize-y"
                        placeholder="<p>Write your amazing blog post here...</p>"
                    />
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
                    {isSaving ? "Publishing..." : "Publish"}
                </button>
            </div>
        </form>
    )
}
