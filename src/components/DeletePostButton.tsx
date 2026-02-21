"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { deletePost } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

export default function DeletePostButton({ id }: { id: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowConfirm(true)
    }

    const cancelDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowConfirm(false)
    }

    const confirmDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        startTransition(async () => {
            try {
                await deletePost(id)
                router.refresh()
            } catch (error) {
                console.error("Delete failed in UI:", error)
                alert("Error deleting post")
                setShowConfirm(false)
            }
        })
    }

    if (showConfirm) {
        return (
            <div className="flex items-center space-x-3 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 animate-in fade-in zoom-in duration-200">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Sure?</span>
                <button
                    onClick={confirmDelete}
                    disabled={isPending}
                    className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-[10px] font-bold transition-colors"
                >
                    {isPending ? "..." : "YES"}
                </button>
                <button
                    onClick={cancelDelete}
                    disabled={isPending}
                    className="text-muted hover:text-white text-[10px] font-bold transition-colors"
                >
                    NO
                </button>
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition-colors flex items-center"
        >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
        </button>
    )
}
