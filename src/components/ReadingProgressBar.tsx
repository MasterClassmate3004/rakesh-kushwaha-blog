"use client"

import { useEffect, useState } from "react"

type ReadingProgressBarProps = {
    targetId: string
}

export default function ReadingProgressBar({ targetId }: ReadingProgressBarProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let frame = 0

        const updateProgress = () => {
            const target = document.getElementById(targetId)
            if (!target) {
                setProgress(0)
                return
            }

            const rect = target.getBoundingClientRect()
            const scrollTop = window.scrollY || window.pageYOffset
            const articleTop = rect.top + scrollTop
            const articleHeight = target.offsetHeight
            const viewportHeight = window.innerHeight
            const maxScroll = Math.max(articleHeight - viewportHeight, 1)
            const nextProgress = ((scrollTop - articleTop) / maxScroll) * 100
            const clampedProgress = Math.min(100, Math.max(0, nextProgress))

            setProgress(clampedProgress)
        }

        const requestUpdate = () => {
            cancelAnimationFrame(frame)
            frame = window.requestAnimationFrame(updateProgress)
        }

        requestUpdate()
        window.addEventListener("scroll", requestUpdate, { passive: true })
        window.addEventListener("resize", requestUpdate)

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener("scroll", requestUpdate)
            window.removeEventListener("resize", requestUpdate)
        }
    }, [targetId])

    return (
        <div
            className="reading-progress-shell fixed inset-x-0 top-14 md:top-16 z-40 h-1 bg-white/5 backdrop-blur-sm"
            aria-hidden="true"
        >
            <div
                className="reading-progress-bar h-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
