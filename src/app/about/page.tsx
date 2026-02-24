import PageTransition from "@/components/PageTransition"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"
import { normalizeAuthorName } from "@/lib/names"

export const metadata: Metadata = {
    title: `${siteConfig.authorName} - About`,
    description: `Learn about ${siteConfig.authorName} and the story behind ${siteConfig.shortName}.`,
    alternates: {
        canonical: "/about",
    },
}

export default async function AboutAuthorPage() {
    let author = null
    try {
        // Fetch the admin user (author) to get their latest profile image
        author = await prisma.user.findFirst({
            where: { role: "ADMIN" }
        })
    } catch (error) {
        console.error("Database connection failed during build/render:", error)
        // This catch block prevents the build from crashing if DB is unavailable
    }

    const name = normalizeAuthorName(author?.name)
    const profileImage = (author as any)?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=b6e3f4`

    return (
        <PageTransition>
            <div className="max-w-3xl mx-auto px-4 py-20">
                <Link href="/" className="inline-flex items-center text-primary hover:text-white transition-colors mb-10 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to blog
                </Link>

                <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
                    <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl skew-y-3">
                        <img
                            src={profileImage}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover -skew-y-3 scale-110"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{name}</h1>
                        <p className="text-xl text-primary font-medium">Passionate Teacher and Author</p>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] space-y-8 text-neutral-300 leading-relaxed text-lg border-white/5">
                    <p>
                        I am {name} <strong>Founder of Mathivation Research Lab</strong> and an <strong>author</strong>. Teaching has never been just a profession for me, it has always been a lifelong passion.
                    </p>
                    <p>
                        With Master's degrees in Mathematics, English, Linguistics, and Economics, along with Bachelor's degrees in Special Education and Information Technology, I have devoted more than three decades to the world of education.
                    </p>
                    <p>
                        I am also the author of the novel <strong>Unrequited Love</strong>, born from my belief that the human heart can be as complex and fascinating as any mathematical problem.
                    </p>
                    <p>
                        Through this platform, I share my thoughts, reflections, and insights through blogs. Here, I write about ideas, experiences, and perspectives that connect education, life, and personal growth, creating a space for learning beyond textbooks.
                    </p>

                    <div className="pt-8 border-t border-white/10 flex justify-center md:justify-start space-x-8">
                        <a href="#" className="hover:text-primary transition-colors">Email</a>
                        <a href="https://www.youtube.com/@Mathivator" className="hover:text-primary transition-colors">Youtube</a>
                        <a href="https://www.linkedin.com/in/rakesh-kushwaha-4033221b/" className="hover:text-primary transition-colors">LinkedIn</a>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
