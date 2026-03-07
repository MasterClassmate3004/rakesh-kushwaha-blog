import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Edit2, LayoutDashboard } from "lucide-react"
import DeletePostButton from "@/components/DeletePostButton"
import { formatDateDDMMYYYY } from "@/lib/date"

export default async function AdminDashboard() {
    const now = new Date()
    let posts: any[] = []
    try {
        posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { comments: true }
                }
            }
        })
    } catch (error) {
        console.error("Admin dashboard database connection failed:", error)
    }

    // Quick stats
    const totalPosts = posts.length
    const publishedPosts = posts.filter((p: any) => p.published).length
    const scheduledPosts = posts.filter((p: any) => p.published && p.publishAt && new Date(p.publishAt) > now).length
    const totalComments = posts.reduce((acc: number, p: any) => acc + p._count.comments, 0)

    return (
        <div className="space-y-8">
            <div className="flex items-center mb-6">
                <LayoutDashboard className="w-8 h-8 text-primary mr-3" />
                <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary">
                    <p className="text-muted text-sm font-medium">Total Posts</p>
                    <p className="text-4xl font-bold mt-2">{totalPosts}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-green-500">
                    <p className="text-muted text-sm font-medium">Published</p>
                    <p className="text-4xl font-bold mt-2">{publishedPosts}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-500">
                    <p className="text-muted text-sm font-medium">Scheduled</p>
                    <p className="text-4xl font-bold mt-2">{scheduledPosts}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-l-fuchsia-500">
                    <p className="text-muted text-sm font-medium">Total Comments</p>
                    <p className="text-4xl font-bold mt-2">{totalComments}</p>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-black/40 text-muted">
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {posts.map((post: any) => (
                            <tr key={post.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium max-w-[200px] truncate">{post.title}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${post.published
                                        ? (post.publishAt && new Date(post.publishAt) > now ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-400')
                                        : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {post.published
                                            ? (post.publishAt && new Date(post.publishAt) > now ? 'Scheduled' : 'Published')
                                            : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-400">
                                    {formatDateDDMMYYYY(post.createdAt, true)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <Link href={`/admin/edit/${post.id}`} className="text-primary hover:text-white transition-colors flex items-center">
                                            <Edit2 className="w-4 h-4 mr-1" />
                                            Edit
                                        </Link>
                                        <DeletePostButton id={post.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && (
                    <div className="text-center py-10 text-muted">
                        No posts found. Start writing!
                    </div>
                )}
            </div>
        </div>
    )
}
