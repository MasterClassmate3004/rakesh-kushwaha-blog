"use client"

import { useMemo, useRef, useState } from "react"
import { savePost } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import {
    Bold,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Pilcrow,
    Quote,
    Redo2,
    SeparatorHorizontal,
    Type,
    Underline,
    Undo2,
    Upload,
    X,
} from "lucide-react"

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
    const [content, setContent] = useState(initialData?.content || "<p class=\"post-body\">Start writing your blog post...</p>")
    const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")
    const [publishAt, setPublishAt] = useState(
        toInputDateTimeLocal(initialData?.publishAt) || toInputDateTimeLocal(initialData?.createdAt) || toInputDateTimeLocal(new Date())
    )
    const [isSaving, setIsSaving] = useState(false)
    const [showHtmlSource, setShowHtmlSource] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const inlineImageInputRef = useRef<HTMLInputElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    const publishAtRef = useRef<HTMLInputElement>(null)
    const [isEditorFocused, setIsEditorFocused] = useState(false)

    const editorClasses = useMemo(() => {
        return [
            "editor-surface",
            "post-content",
            "prose",
            "prose-invert",
            "prose-lg",
            "max-w-none",
            "min-h-[420px]",
            "rounded-xl",
            "border",
            "px-4",
            "py-4",
            "outline-none",
            "transition-all",
            isEditorFocused ? "border-primary/50 ring-2 ring-primary/30" : "border-white/10",
            "bg-black/30",
            "text-white",
        ].join(" ")
    }, [isEditorFocused])

    const syncContentFromEditor = () => {
        const html = editorRef.current?.innerHTML ?? ""
        setContent(html)
    }

    const ensureEditorFocus = () => {
        editorRef.current?.focus()
    }

    const runCommand = (command: string, value?: string) => {
        ensureEditorFocus()
        document.execCommand(command, false, value)
        syncContentFromEditor()
    }

    const applyBlockStyle = (tagName: "P" | "H2" | "H3" | "BLOCKQUOTE", className: string) => {
        runCommand("formatBlock", tagName)
        const selection = window.getSelection()
        if (!selection?.anchorNode) return

        const anchorElement =
            selection.anchorNode.nodeType === Node.ELEMENT_NODE
                ? (selection.anchorNode as HTMLElement)
                : selection.anchorNode.parentElement

        const block = anchorElement?.closest(tagName.toLowerCase())
        if (block) {
            block.className = className
            syncContentFromEditor()
        }
    }

    const applyListStyle = (ordered: boolean) => {
        runCommand(ordered ? "insertOrderedList" : "insertUnorderedList")
        const selection = window.getSelection()
        if (!selection?.anchorNode) return
        const anchorElement =
            selection.anchorNode.nodeType === Node.ELEMENT_NODE
                ? (selection.anchorNode as HTMLElement)
                : selection.anchorNode.parentElement
        const list = anchorElement?.closest(ordered ? "ol" : "ul")
        if (list) {
            list.className = ordered ? "post-list-ordered" : "post-list"
            syncContentFromEditor()
        }
    }

    const insertLink = () => {
        ensureEditorFocus()
        const url = window.prompt("Enter URL (https://...)")
        if (!url) return
        runCommand("createLink", url)
    }

    const insertInlineImage = (dataUrl: string) => {
        ensureEditorFocus()
        runCommand("insertImage", dataUrl)
    }

    const handleInlineImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.")
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("Inline image must be under 2MB.")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            insertInlineImage(reader.result as string)
        }
        reader.readAsDataURL(file)
        e.target.value = ""
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
        const latestContent = editorRef.current?.innerHTML?.trim() || content.trim()
        if (!latestContent) {
            alert("Post content is required.")
            return
        }

        setIsSaving(true)

        await savePost({
            id: initialData?.id,
            title,
            caption: caption || undefined,
            content: latestContent,
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
                    <label className="block text-sm font-medium text-muted mb-2">Content Editor</label>
                    <p className="text-xs text-muted/90 mb-2">
                        Format text directly like a normal editor. Your styles are shown live while writing.
                    </p>
                    <div className="glass-card rounded-2xl p-3 mb-3 border border-white/10">
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => runCommand("bold")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Bold className="w-3.5 h-3.5" /> Bold
                            </button>
                            <button type="button" onClick={() => runCommand("italic")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Italic className="w-3.5 h-3.5" /> Italic
                            </button>
                            <button type="button" onClick={() => runCommand("underline")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Underline className="w-3.5 h-3.5" /> Underline
                            </button>
                            <button type="button" onClick={() => applyBlockStyle("P", "post-body")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Pilcrow className="w-3.5 h-3.5" /> Paragraph
                            </button>
                            <button type="button" onClick={() => applyBlockStyle("H2", "post-heading")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Heading2 className="w-3.5 h-3.5" /> Heading
                            </button>
                            <button type="button" onClick={() => applyBlockStyle("H3", "post-subheading")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Heading3 className="w-3.5 h-3.5" /> Subheading
                            </button>
                            <button type="button" onClick={() => applyBlockStyle("BLOCKQUOTE", "post-quote")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Quote className="w-3.5 h-3.5" /> Quote
                            </button>
                            <button type="button" onClick={() => applyListStyle(false)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <List className="w-3.5 h-3.5" /> Bullets
                            </button>
                            <button type="button" onClick={() => applyListStyle(true)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <ListOrdered className="w-3.5 h-3.5" /> Numbered
                            </button>
                            <button type="button" onClick={insertLink} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <LinkIcon className="w-3.5 h-3.5" /> Link
                            </button>
                            <button type="button" onClick={() => runCommand("unlink")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <X className="w-3.5 h-3.5" /> Unlink
                            </button>
                            <button type="button" onClick={() => runCommand("insertHorizontalRule")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <SeparatorHorizontal className="w-3.5 h-3.5" /> HR
                            </button>
                            <button type="button" onClick={() => runCommand("insertLineBreak")} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                                <Type className="w-3.5 h-3.5" /> BR
                            </button>
                            <button type="button" onClick={() => inlineImageInputRef.current?.click()} className="px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25 flex items-center gap-1.5">
                                <ImagePlus className="w-3.5 h-3.5" /> Insert Image
                            </button>
                            <button type="button" onClick={() => runCommand("undo")} className="px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25 flex items-center gap-1.5">
                                <Undo2 className="w-3.5 h-3.5" /> Undo
                            </button>
                            <button type="button" onClick={() => runCommand("redo")} className="px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25 flex items-center gap-1.5">
                                <Redo2 className="w-3.5 h-3.5" /> Redo
                            </button>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={inlineImageInputRef}
                        onChange={handleInlineImageFile}
                        className="hidden"
                    />
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        className={editorClasses}
                        onInput={syncContentFromEditor}
                        onFocus={() => setIsEditorFocused(true)}
                        onBlur={() => setIsEditorFocused(false)}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => setShowHtmlSource((prev) => !prev)}
                            className="text-xs text-primary hover:underline"
                        >
                            {showHtmlSource ? "Hide HTML source" : "Show HTML source (advanced)"}
                        </button>
                        {showHtmlSource && (
                            <textarea
                                value={content}
                                onChange={(e) => {
                                    const next = e.target.value
                                    setContent(next)
                                    if (editorRef.current) {
                                        editorRef.current.innerHTML = next
                                    }
                                }}
                                className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[180px] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        )}
                    </div>
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
