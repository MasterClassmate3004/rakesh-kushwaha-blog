import PageTransition from "@/components/PageTransition"
import PortfolioShowcase from "@/components/PortfolioShowcase"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Portfolio & Ventures",
    description: "Explore books, research, blogs, and the vision of Mathivation.",
}

export default function PortfolioPage() {
    return (
        <PageTransition>
            <PortfolioShowcase />
        </PageTransition>
    )
}
