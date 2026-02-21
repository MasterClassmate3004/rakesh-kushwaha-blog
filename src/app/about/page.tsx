import PageTransition from "@/components/PageTransition"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function AboutAuthorPage() {
    // Fetch the admin user (author) to get their latest profile image
    const author = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    })

    const name = author?.name || "Nitya Jain"
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
                            className="w-full h-full object-cover -skew-y-3 scale-110"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{name}</h1>
                        <p className="text-xl text-primary font-medium">Software Engineer & Creative Designer</p>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] space-y-8 text-neutral-300 leading-relaxed text-lg border-white/5">
                    <p>
                        Welcome! I'm {name}, a developer with a deep interest in building digital experiences that are not just functional, but emotionally resonant and visually stunning.
                    </p>
                    <p>
                        My work focus is mainly on <strong>React</strong>, <strong>Next.js</strong>, and <strong>Clean UI/UX</strong>. I believe that every detail, from the micro-interactions to the overall architecture, contributes to the user's journey.
                    </p>
                    <p>
                        In this blog, I share my learnings about the cutting edge of web technology, design systems, and the occasional deep dive into backend security.
                    </p>

                    <div className="pt-8 border-t border-white/10 flex justify-center md:justify-start space-x-8">
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">GitHub</a>
                        <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
