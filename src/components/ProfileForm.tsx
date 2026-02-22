"use client"

import { useState, useRef, useTransition } from "react"
import { updateProfileImage } from "@/app/actions/user"
import { Camera, Check, X, LogOut, Upload, Moon, Sun } from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme } from "@/components/ThemeProvider"

interface ProfileFormProps {
    user: {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const { theme, toggleTheme } = useTheme()
    const [isEditing, setIsEditing] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(user.image || "")
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File is too large. Please select an image under 2MB.")
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setPreviewUrl(base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        startTransition(async () => {
            try {
                await updateProfileImage(previewUrl)
                setIsEditing(false)
                // Short timeout to allow DB revalidation to kick in
                setTimeout(() => {
                    window.location.reload()
                }, 100)
            } catch (error) {
                console.error(error)
                alert("Failed to update profile image")
            }
        })
    }

    return (
        <div className="space-y-8 w-full max-w-md mx-auto">
            <div className="relative group mx-auto w-32 h-32">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-black/40">
                    <img
                        src={previewUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name || 'User'}&backgroundColor=b6e3f4`}
                        alt="Profile"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full"
                >
                    <Camera className="w-8 h-8 text-white" />
                </button>
            </div>

            {isEditing && (
                <div className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
                    <label className="block text-sm font-medium text-muted mb-3">Change Profile Photo</label>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Select Image from PC
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isPending || !previewUrl}
                                className="flex-1 bg-primary text-white py-2 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                {isPending ? "Saving..." : <><Check className="w-4 h-4" /> Save Changes</>}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false)
                                    setPreviewUrl(user.image || "")
                                }}
                                className="bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center">
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-white">{user.name}</h1>
                <p className="text-xl text-primary font-medium">My Profile</p>
            </div>

            <div className="space-y-4">
                <div className="glass-card p-8 rounded-3xl text-left border border-white/5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest">Email Address</label>
                        <p className="text-white text-lg font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-white">Theme</p>
                            <p className="text-xs text-muted">Switch between dark and light mode</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`relative w-16 h-9 rounded-full border transition-colors ${theme === "dark"
                                    ? "bg-white border-white/80"
                                    : "bg-slate-900 border-slate-700"
                                }`}
                            aria-label="Toggle theme"
                        >
                            <span
                                className={`absolute top-1 h-7 w-7 rounded-full shadow-md transition-all flex items-center justify-center ${theme === "dark"
                                        ? "left-8 bg-slate-900"
                                        : "left-1 bg-white"
                                    }`}
                            >
                                {theme === "dark" ? (
                                    <Moon className="w-4 h-4 text-white" />
                                ) : (
                                    <Sun className="w-4 h-4 text-slate-900" />
                                )}
                            </span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-semibold"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
