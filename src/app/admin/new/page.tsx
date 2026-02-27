import Editor from "@/components/Editor"

export default function NewPostPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create New Post</h1>
                <p className="text-muted">Use the writing studio to draft long-form posts, then publish or schedule when ready.</p>
            </div>
            <Editor />
        </div>
    )
}
