"use client"

import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { ArrowRight, BookOpen, Layers, Youtube } from "lucide-react"

export default function LandingHero3D() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.1 }
        }
    }
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    }

    return (
        <>
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden w-full pt-20">
            {/* Background glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center space-y-8"
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Mathivation Research Lab Initiative
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60 drop-shadow-sm">
                    Re-engineering <br/>
                    <span className="text-primary italic">Pedagogy & Logic</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted max-w-2xl leading-relaxed">
                    Bridging abstract mathematics and practical reality through literature, research, and dynamic visual learning.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-wrap gap-4 items-center justify-center pt-8">
                    <Link href="/portfolio" className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95">
                        <Layers className="w-5 h-5" />
                        Explore Ventures
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/about" className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold hover:scale-105 active:scale-95">
                        Author Vision
                    </Link>
                </motion.div>

            </motion.div>
        </section>
        
        {/* Scroll-Revealed Value Props */}
        <section className="relative z-10 w-full py-24 bg-gradient-to-b from-transparent to-black/40">
            <motion.div 
                 initial="hidden"
                 whileInView="show"
                 viewport={{ once: true, margin: "100px 0px 100px 0px" }}
                 variants={{
                     hidden: { opacity: 0 },
                     show: {
                         opacity: 1,
                         transition: { staggerChildren: 0.25 }
                     }
                 }}
                 className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
            >
                {[
                    { icon: BookOpen, title: "Published Literature", desc: "Rigorous mathematical frameworks.", slideDirection: -100 },
                    { icon: Youtube, title: "Digital Broadcasts", desc: "Dynamic motion-graphic lectures.", slideDirection: 0 },
                    { icon: Layers, title: "Editorial Research", desc: "Hypotheses and real-world logic.", slideDirection: 100 },
                ].map((item, i) => (
                    <motion.div 
                        key={i} 
                        variants={{
                            hidden: { opacity: 0, x: item.slideDirection, y: item.slideDirection === 0 ? 100 : 0 },
                            show: { opacity: 1, x: 0, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
                        }}
                        className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-colors hover:bg-white/5 group cursor-default shadow-2xl bg-black/60 backdrop-blur-xl relative overflow-hidden"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors border border-white/5 relative z-10 shadow-lg">
                            <item.icon className="w-7 h-7 text-white/70 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-white/95 mb-3 relative z-10">{item.title}</h3>
                        <p className="text-base text-neutral-400 relative z-10 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
        </>
    )
}
