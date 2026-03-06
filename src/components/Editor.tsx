"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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

const DEFAULT_CONTENT = "<p class=\"post-body\">Start writing your blog post...</p>"
const AUTOSAVE_DELAY_MS = 1200

type SaveMode = "draft" | "publish"
type ViewMode = "write" | "split" | "preview"

type EditorSnapshot = {
    title: string
    caption: string
    content: string
    imageUrl: string
    publishAt: string
}

type LocalDraft = EditorSnapshot & {
    savedAt: number
}

type OutlineItem = {
    level: 2 | 3
    text: string
    index: number
}

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

function buildSnapshot(input: EditorSnapshot): EditorSnapshot {
    return {
        title: input.title.trim(),
        caption: input.caption.trim(),
        content: input.content,
        imageUrl: input.imageUrl.trim(),
        publishAt: input.publishAt,
    }
}

function snapshotToKey(snapshot: EditorSnapshot) {
    return JSON.stringify(snapshot)
}

function plainTextFromHtml(html: string) {
    return html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

function extractOutlineFromHtml(html: string): OutlineItem[] {
    const outline: OutlineItem[] = []
    const headingRegex = /<(h2|h3)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi
    let match: RegExpExecArray | null
    let index = 0

    while (true) {
        match = headingRegex.exec(html)
        if (!match) break

        const level: 2 | 3 = match[1].toLowerCase() === "h2" ? 2 : 3
        const text = plainTextFromHtml(match[2]) || `Section ${index + 1}`
        outline.push({ level, text, index })
        index += 1
    }

    return outline
}

function formatClockTime(value: Date | null) {
    if (!value || Number.isNaN(value.getTime())) return null
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(value)
}

function formatDateTimeLabel(value: string) {
    if (!value) return "Not set"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return "Invalid date"
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(parsed)
}

function isLinkValueAllowed(url: string) {
    return /^https?:\/\//i.test(url) || url.startsWith("/")
}

function formatSlugPreview(title: string) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    return slug || "your-post-slug"
}

export default function Editor({ initialData }: EditorProps) {
    const router = useRouter()
    const initialTitle = initialData?.title || ""
    const initialCaption = initialData?.caption || ""
    const initialContent = initialData?.content || DEFAULT_CONTENT
    const initialImageUrl = initialData?.imageUrl || ""
    const initialPublishAt = useMemo(
        () =>
            toInputDateTimeLocal(initialData?.publishAt) ||
            toInputDateTimeLocal(initialData?.createdAt) ||
            toInputDateTimeLocal(new Date()),
        [initialData?.createdAt, initialData?.publishAt]
    )

    const initialSnapshot = useMemo(
        () =>
            snapshotToKey(
                buildSnapshot({
                    title: initialTitle,
                    caption: initialCaption,
                    content: initialContent,
                    imageUrl: initialImageUrl,
                    publishAt: initialPublishAt,
                })
            ),
        [initialCaption, initialContent, initialImageUrl, initialPublishAt, initialTitle]
    )

    const [title, setTitle] = useState(initialTitle)
    const [caption, setCaption] = useState(initialCaption)
    const [content, setContent] = useState(initialContent)
    const [imageUrl, setImageUrl] = useState(initialImageUrl)
    const [coverUrlInput, setCoverUrlInput] = useState(initialImageUrl.startsWith("http") ? initialImageUrl : "")
    const [publishAt, setPublishAt] = useState(
        initialPublishAt
    )
    const [saveMode, setSaveMode] = useState<SaveMode | null>(null)
    const [showHtmlSource, setShowHtmlSource] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("write")
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [baselineSnapshot, setBaselineSnapshot] = useState(initialSnapshot)
    const [lastAutoSaveAt, setLastAutoSaveAt] = useState<Date | null>(null)
    const [lastServerSaveAt, setLastServerSaveAt] = useState<Date | null>(null)
    const [recoveredDraft, setRecoveredDraft] = useState<LocalDraft | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const inlineImageInputRef = useRef<HTMLInputElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    const publishAtRef = useRef<HTMLInputElement>(null)
    const selectionRangeRef = useRef<Range | null>(null)
    const [isEditorFocused, setIsEditorFocused] = useState(false)
    const LINE_SPACING_CLASSES = ["post-line-tight", "post-line-normal", "post-line-relaxed"]

    const draftStorageKey = useMemo(() => `blog-editor-draft:${initialData?.id || "new"}`, [initialData?.id])

    const currentSnapshot = useMemo(
        () =>
            buildSnapshot({
                title,
                caption,
                content,
                imageUrl,
                publishAt,
            }),
        [caption, content, imageUrl, publishAt, title]
    )
    const currentSnapshotKey = useMemo(() => snapshotToKey(currentSnapshot), [currentSnapshot])
    const hasUnsavedChanges = currentSnapshotKey !== baselineSnapshot
    const plainText = useMemo(() => plainTextFromHtml(content), [content])
    const wordCount = useMemo(() => (plainText ? plainText.split(/\s+/).length : 0), [plainText])
    const characterCount = plainText.length
    const paragraphCount = useMemo(() => (content.match(/<p\b/gi) || []).length, [content])
    const readMinutes = wordCount ? Math.max(1, Math.ceil(wordCount / 200)) : 0
    const outline = useMemo(() => extractOutlineFromHtml(content), [content])
    const titleLength = title.trim().length
    const captionLength = caption.trim().length
    const publishAtDate = useMemo(() => (publishAt ? new Date(publishAt) : null), [publishAt])
    const isPublishAtValid = !!publishAtDate && !Number.isNaN(publishAtDate.getTime())
    const isFuturePublish = isPublishAtValid ? publishAtDate.getTime() > Date.now() : false
    const publishButtonLabel = isFuturePublish
        ? "Schedule Post"
        : initialData?.id
            ? "Update & Publish"
            : "Publish Now"

    const editorClasses = useMemo(() => {
        return [
            "editor-surface",
            "post-content",
            "prose",
            "prose-invert",
            "prose-lg",
            "max-w-none",
            "min-h-[520px]",
            "rounded-xl",
            "border",
            "px-4",
            "py-4",
            "outline-none",
            "transition-all",
            isEditorFocused ? "border-primary/50 ring-2 ring-primary/30" : "border-white/10",
            "bg-black/30",
            "text-white",
            "shadow-inner",
        ].join(" ")
    }, [isEditorFocused])

    useEffect(() => {
        if (typeof window === "undefined") return
        try {
            const raw = localStorage.getItem(draftStorageKey)
            if (!raw) return
            const parsed = JSON.parse(raw) as Partial<LocalDraft>
            if (
                typeof parsed.title !== "string" ||
                typeof parsed.caption !== "string" ||
                typeof parsed.content !== "string" ||
                typeof parsed.imageUrl !== "string" ||
                typeof parsed.publishAt !== "string" ||
                typeof parsed.savedAt !== "number"
            ) {
                return
            }

            const parsedSnapshot = snapshotToKey(
                buildSnapshot({
                    title: parsed.title,
                    caption: parsed.caption,
                    content: parsed.content,
                    imageUrl: parsed.imageUrl,
                    publishAt: parsed.publishAt,
                })
            )

            if (parsedSnapshot !== initialSnapshot) {
                setRecoveredDraft({
                    title: parsed.title,
                    caption: parsed.caption,
                    content: parsed.content,
                    imageUrl: parsed.imageUrl,
                    publishAt: parsed.publishAt,
                    savedAt: parsed.savedAt,
                })
            }
        } catch {
            // Ignore malformed local draft data.
        }
    }, [draftStorageKey, initialSnapshot])

    useEffect(() => {
        if (typeof window === "undefined" || !hasUnsavedChanges) return

        const timer = window.setTimeout(() => {
            try {
                const now = Date.now()
                const payload: LocalDraft = {
                    ...currentSnapshot,
                    savedAt: now,
                }
                localStorage.setItem(draftStorageKey, JSON.stringify(payload))
                setLastAutoSaveAt(new Date(now))
            } catch {
                // Ignore storage write failures.
            }
        }, AUTOSAVE_DELAY_MS)

        return () => window.clearTimeout(timer)
    }, [currentSnapshot, draftStorageKey, hasUnsavedChanges])

    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!hasUnsavedChanges || saveMode) return
            event.preventDefault()
            event.returnValue = ""
        }

        window.addEventListener("beforeunload", onBeforeUnload)
        return () => window.removeEventListener("beforeunload", onBeforeUnload)
    }, [hasUnsavedChanges, saveMode])

    useEffect(() => {
        if (!statusMessage) return
        const timer = window.setTimeout(() => setStatusMessage(null), 2800)
        return () => window.clearTimeout(timer)
    }, [statusMessage])

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
            const currentLineClass = LINE_SPACING_CLASSES.find((c) => block.classList.contains(c))
            block.className = className
            if (currentLineClass) {
                block.classList.add(currentLineClass)
            }
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

    const openLinkInput = () => {
        ensureEditorFocus()
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            selectionRangeRef.current = selection.getRangeAt(0).cloneRange()
        }
        setShowLinkInput(true)
    }

    const restoreSelection = () => {
        if (!selectionRangeRef.current) return
        const selection = window.getSelection()
        if (!selection) return
        selection.removeAllRanges()
        selection.addRange(selectionRangeRef.current)
    }

    const applyLinkFromInput = () => {
        const normalizedUrl = linkUrl.trim()
        if (!normalizedUrl) {
            setShowLinkInput(false)
            return
        }
        if (!isLinkValueAllowed(normalizedUrl)) {
            alert("Please enter a valid URL that starts with https://, http://, or /.")
            return
        }
        ensureEditorFocus()
        restoreSelection()
        runCommand("createLink", normalizedUrl)
        setLinkUrl("")
        setShowLinkInput(false)
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

    const applyLineSpacing = (spacingClass: "post-line-tight" | "post-line-normal" | "post-line-relaxed") => {
        ensureEditorFocus()
        const selection = window.getSelection()
        if (!selection?.anchorNode) return

        const anchorElement =
            selection.anchorNode.nodeType === Node.ELEMENT_NODE
                ? (selection.anchorNode as HTMLElement)
                : selection.anchorNode.parentElement

        const block = anchorElement?.closest("p, h2, h3, blockquote, li")
        if (!block) return

        LINE_SPACING_CLASSES.forEach((cls) => block.classList.remove(cls))
        block.classList.add(spacingClass)
        syncContentFromEditor()
    }

    const keepSelectionOnToolbarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest("button")) {
            e.preventDefault()
        }
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
            setCoverUrlInput("")
        }
        reader.readAsDataURL(file)
    }

    const insertSnippet = (htmlSnippet: string) => {
        runCommand("insertHTML", htmlSnippet)
    }

    const insertSectionTemplate = () => {
        insertSnippet("<h2 class=\"post-heading\">New section heading</h2><p class=\"post-body\">Write the key idea for this section.</p>")
    }

    const insertCalloutTemplate = () => {
        insertSnippet("<div class=\"post-callout\"><p class=\"post-body\"><strong>Key takeaway:</strong> Add a short highlight for readers.</p></div>")
    }

    const insertFaqTemplate = () => {
        insertSnippet("<h3 class=\"post-subheading\">Common question</h3><p class=\"post-body\">Give a clear answer in plain language.</p>")
    }

    const insertListTemplate = () => {
        insertSnippet("<h3 class=\"post-subheading\">Checklist</h3><ul class=\"post-list\"><li>First key point</li><li>Second key point</li><li>Third key point</li></ul>")
    }

    const jumpToHeading = (outlineIndex: number) => {
        const headings = editorRef.current?.querySelectorAll("h2, h3")
        const target = headings?.item(outlineIndex) as HTMLElement | null
        if (!target) return

        target.scrollIntoView({ behavior: "smooth", block: "center" })
        ensureEditorFocus()
        const range = document.createRange()
        range.selectNodeContents(target)
        range.collapse(false)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
    }

    const applyCoverUrl = () => {
        const normalized = coverUrlInput.trim()
        if (!normalized) {
            setImageUrl("")
            return
        }
        if (!/^https:\/\//i.test(normalized)) {
            alert("Cover image URL must start with https://")
            return
        }
        setImageUrl(normalized)
    }

    const setPublishNow = () => {
        setPublishAt(toInputDateTimeLocal(new Date()))
    }

    const setPublishTomorrowMorning = () => {
        const next = new Date()
        next.setDate(next.getDate() + 1)
        next.setHours(9, 0, 0, 0)
        setPublishAt(toInputDateTimeLocal(next))
    }

    const restoreRecoveredDraft = () => {
        if (!recoveredDraft) return
        setTitle(recoveredDraft.title)
        setCaption(recoveredDraft.caption)
        setContent(recoveredDraft.content)
        setImageUrl(recoveredDraft.imageUrl)
        setCoverUrlInput(recoveredDraft.imageUrl.startsWith("http") ? recoveredDraft.imageUrl : "")
        setPublishAt(recoveredDraft.publishAt)
        setLastAutoSaveAt(new Date(recoveredDraft.savedAt))
        setRecoveredDraft(null)
        setStatusMessage("Recovered your local draft.")
    }

    const discardRecoveredDraft = () => {
        setRecoveredDraft(null)
        try {
            localStorage.removeItem(draftStorageKey)
        } catch {
            // Ignore storage cleanup failures.
        }
    }

    const persistPost = async (mode: SaveMode) => {
        if (saveMode) return
        if (!title.trim()) {
            alert("Post title is required.")
            return
        }
        const latestContent = editorRef.current?.innerHTML?.trim() || content.trim()
        const latestText = plainTextFromHtml(latestContent)
        if (!latestText) {
            alert("Post content is required.")
            return
        }
        if (!isPublishAtValid) {
            alert("Please select a valid publish date and time.")
            return
        }
        const normalizedImage = imageUrl.trim()
        if (mode === "publish" && !normalizedImage) {
            alert("Cover image is required to publish.")
            return
        }
        if (normalizedImage && /^http:\/\//i.test(normalizedImage)) {
            alert("Cover image URL must use HTTPS.")
            return
        }

        setSaveMode(mode)
        setStatusMessage(mode === "draft" ? "Saving draft..." : "Publishing...")

        try {
            const postId = await savePost({
                id: initialData?.id,
                title: title.trim(),
                caption: caption || undefined,
                content: latestContent,
                imageUrl: normalizedImage || null,
                published: mode === "publish",
                scheduleAt: publishAt || undefined,
            })

            const savedSnapshotKey = snapshotToKey(
                buildSnapshot({
                    title: title.trim(),
                    caption,
                    content: latestContent,
                    imageUrl: normalizedImage,
                    publishAt,
                })
            )
            setBaselineSnapshot(savedSnapshotKey)
            setLastServerSaveAt(new Date())
            try {
                localStorage.removeItem(draftStorageKey)
            } catch {
                // Ignore storage cleanup failures.
            }

            if (mode === "publish") {
                router.push("/admin")
                router.refresh()
                return
            }

            setStatusMessage("Draft saved.")
            if (!initialData?.id) {
                router.push(`/admin/edit/${postId}`)
                router.refresh()
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save post."
            alert(message)
            setStatusMessage(message)
        } finally {
            setSaveMode(null)
        }
    }

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        void persistPost("publish")
    }

    const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const key = event.key.toLowerCase()
        const isModifierPressed = event.metaKey || event.ctrlKey

        if (!isModifierPressed) return
        if (key === "s") {
            event.preventDefault()
            void persistPost("draft")
            return
        }
        if (event.shiftKey && key === "k") {
            event.preventDefault()
            openLinkInput()
        }
    }

    const handleCancel = () => {
        if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Leave this page?")) {
            return
        }
        router.back()
    }

    const handleToolbarMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        if (target.closest("button")) {
            event.preventDefault()
        }
    }

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6 max-w-6xl">
            <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Writing Studio</h2>
                        <p className="text-sm text-muted mt-1">
                            Built for long-form posts: auto-save, outline navigation, and distraction-free formatting.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2.5 py-1 rounded-full border ${hasUnsavedChanges ? "border-amber-300/40 text-amber-200 bg-amber-500/10" : "border-emerald-300/40 text-emerald-200 bg-emerald-500/10"}`}>
                            {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
                        </span>
                        {lastAutoSaveAt && (
                            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-black/30 text-muted">
                                Local auto-save {formatClockTime(lastAutoSaveAt)}
                            </span>
                        )}
                        {lastServerSaveAt && (
                            <span className="px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
                                Server save {formatClockTime(lastServerSaveAt)}
                            </span>
                        )}
                    </div>
                </div>

                {statusMessage && (
                    <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
                        {statusMessage}
                    </div>
                )}

                {recoveredDraft && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-white/90">
                            Recovered an unsaved local draft from {formatDateTimeLabel(toInputDateTimeLocal(new Date(recoveredDraft.savedAt)))}.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={restoreRecoveredDraft}
                                className="px-3 py-1.5 rounded-lg text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                            >
                                Restore Draft
                            </button>
                            <button
                                type="button"
                                onClick={discardRecoveredDraft}
                                className="px-3 py-1.5 rounded-lg text-xs bg-black/40 text-muted hover:text-white transition-colors"
                            >
                                Ignore
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-muted">Post Title</label>
                                    <span className="text-xs text-muted">{titleLength} chars</span>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-xl font-bold transition-all"
                                    placeholder="Write a clear headline..."
                                />
                                <p className="text-xs text-muted mt-2">
                                    URL preview: /blog/{formatSlugPreview(title)}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-muted">Caption (Optional)</label>
                                    <span className="text-xs text-muted">{captionLength} chars</span>
                                </div>
                                <textarea
                                    value={caption}
                                    onChange={(event) => setCaption(event.target.value)}
                                    rows={3}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y"
                                    placeholder="A concise summary shown in cards and search results..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Publish Date & Time</label>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <input
                                        ref={publishAtRef}
                                        type="datetime-local"
                                        required
                                        value={publishAt}
                                        onChange={(event) => setPublishAt(event.target.value)}
                                        onFocus={() => publishAtRef.current?.showPicker?.()}
                                        className="w-full sm:w-96 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={setPublishNow}
                                            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            Set Now
                                        </button>
                                        <button
                                            type="button"
                                            onClick={setPublishTomorrowMorning}
                                            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            Tomorrow 9:00 AM
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted/90 mt-2">
                                    {isPublishAtValid
                                        ? `${isFuturePublish ? "This will be scheduled for" : "This will appear with"} ${formatDateTimeLabel(publishAt)}.`
                                        : "Choose a valid date and time to publish or schedule this post."}
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
                            </section>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => void persistPost("draft")}
                                disabled={!!saveMode}
                                className="px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-60"
                            >
                                {saveMode === "draft" ? "Saving Draft..." : "Save Draft"}
                            </button>
                            <button
                                type="submit"
                                disabled={!!saveMode}
                                className="bg-primary text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-60 transition-colors"
                            >
                                {saveMode === "publish" ? (isFuturePublish ? "Scheduling..." : "Publishing...") : publishButtonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        )
}
