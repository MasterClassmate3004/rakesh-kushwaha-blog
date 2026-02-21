import Editor from "@/components/Editor"

export default function NewPostPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create New Post</h1>
                <p className="text-muted">Draft a new post and share your thoughts.</p>
            </div>
            <Editor />
        </div>
    )
}
