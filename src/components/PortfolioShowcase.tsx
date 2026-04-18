"use client"

import { motion, Variants } from "framer-motion"
import { ArrowRight, BookOpen, ExternalLink, Youtube, Presentation } from "lucide-react"

export default function PortfolioShowcase() {
    const listVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    }
    
    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
            <motion.header 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-24 space-y-6 text-center"
            >
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    My Works & <span className="text-primary">Projects</span>
                </h1>
                <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto">
                    A collection of my books, YouTube videos, and blog posts dedicated to making math, logic, and learning engaging and practical for everyone.
                </p>
            </motion.header>

            <div className="space-y-40">
                {/* Books Section */}
                <motion.section 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={listVariants}
                    className="flex flex-col gap-12"
                >
                    <motion.div variants={cardVariants} className="text-center max-w-3xl mx-auto space-y-4 mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold">Published Books</h2>
                        <p className="text-lg text-muted/90 leading-relaxed">
                            I write books to guide students and curious minds through mathematics and life's unspoken paths. My goal is to make complex ideas simple, build strong logical reasoning, and explore the emotional journey of learning and growing.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
                        {/* Book 1 */}
                        <motion.div 
                            variants={cardVariants}
                            whileHover={{ y: -10 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center group transition-colors hover:bg-white/10"
                        >
                            <div className="relative w-48 h-72 mb-8 perspective-1000">
                                <motion.img 
                                    src="/unspoken-paths.png" 
                                    alt="Unspoken Paths Book Cover" 
                                    className="w-full h-full object-cover rounded-md shadow-2xl shadow-black/50"
                                    whileHover={{ rotateY: 15, scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white/95">Unspoken Paths</h3>
                            <p className="text-sm text-primary mb-4 font-medium">An Evolution Of Unrequited Love</p>
                            <p className="text-sm text-muted mb-6">
                                A captivating novel that dives deep into the human experience and the emotional trails we walk.
                            </p>
                            <a target="_blank" rel="noopener noreferrer" href="https://www.amazon.in/stores/RAKESH-KUSHWAHA/author/B0DS9SYC9L?ref=ap_rdr&shoppingPortalEnabled=true" className="mt-auto px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                                Get on Amazon <ExternalLink className="w-4 h-4" />
                            </a>
                        </motion.div>

                        {/* Book 2 */}
                        <motion.div 
                            variants={cardVariants}
                            whileHover={{ y: -10 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center group transition-colors hover:bg-white/10"
                        >
                            <div className="relative w-48 h-72 mb-8 perspective-1000">
                                <motion.img 
                                    src="/social-math.png" 
                                    alt="Social Math Book Cover" 
                                    className="w-full h-full object-cover rounded-md shadow-2xl shadow-black/50"
                                    whileHover={{ rotateY: -15, scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white/95">Social Math</h3>
                            <p className="text-sm text-primary mb-4 font-medium">A Structural Framework for Human Balance</p>
                            <p className="text-sm text-muted mb-6">
                                A unique perspective on using mathematical principles to understand social frameworks and maintain balance.
                            </p>
                            <a target="_blank" rel="noopener noreferrer" href="https://www.amazon.in/stores/RAKESH-KUSHWAHA/author/B0DS9SYC9L?ref=ap_rdr&shoppingPortalEnabled=true" className="mt-auto px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                                Get on Amazon <ExternalLink className="w-4 h-4" />
                            </a>
                        </motion.div>
                    </div>
                </motion.section>

                {/* YouTube Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                >
                    <div className="space-y-6">
                        <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl mb-2 text-red-500">
                            <Youtube className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold border-l-4 border-red-500 pl-4">Digital Broadcasts</h2>
                        <p className="text-lg text-muted/90 leading-relaxed">
                            On the Mathivator channel, I bring math to life through videos. I break down tough concepts using visuals and simple explanations so that anyone can learn and enjoy mathematics.
                        </p>
                        <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@Mathivator" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-bold shadow-lg shadow-red-500/20 group">
                            Visit Mathivator Channel
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden flex flex-col border border-white/10 bg-black shadow-2xl group"
                    >
                        {/* Video thumbnail abstraction */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000')] bg-cover bg-center opacity-40 transition-opacity duration-500 group-hover:opacity-60" />
                        
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@Mathivator" className="w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-transform hover:scale-110 hover:bg-red-500">
                                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </a>
                        </div>
                        
                        {/* Fake player bottom bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 p-1 flex items-center justify-center backdrop-blur-sm border border-white/20">
                                     <Youtube className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm drop-shadow-md">Mathivator Channel</p>
                                    <p className="text-white/80 text-xs drop-shadow-md">Dynamic visual pedagogy • Subscribe</p>
                                </div>
                            </div>
                            <div className="mt-4 w-full h-1 bg-white/30 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Blogs Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse"
                >
                    <div className="order-2 md:order-1 relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden p-8 border border-white/10 bg-gradient-to-br from-black/40 to-emerald-500/10 shadow-2xl flex items-center justify-center">
                        <motion.div 
                            animate={{ y: [0, -10, 0] }} 
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="bg-black/60 p-6 rounded-2xl border border-white/10 w-3/4 space-y-4 backdrop-blur-md"
                        >
                            <div className="h-4 w-3/4 bg-emerald-500/20 rounded" />
                            <div className="h-4 w-full bg-white/10 rounded" />
                            <div className="h-4 w-5/6 bg-white/10 rounded" />
                            <div className="h-4 w-2/3 bg-white/10 rounded" />
                        </motion.div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-2 text-emerald-500">
                            <Presentation className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold border-l-4 border-emerald-500 pl-4">Articles & Thoughts</h2>
                        <p className="text-lg text-muted/90 leading-relaxed">
                            My blog is a space where I share my ongoing thoughts, research, and teaching tips. It's a place to explore the deep connection between math, education, and our everyday human experiences.
                        </p>
                        <a target="_blank" rel="noopener noreferrer" href="https://mathivationhub.blogspot.com" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-sm font-bold shadow-lg shadow-emerald-500/20 group">
                            Read the Blog
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </motion.section>

            </div>
        </div>
    )
}
