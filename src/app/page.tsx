import PageTransition from "@/components/PageTransition"
import LandingHero3D from "@/components/LandingHero3D"
import { siteConfig } from "@/lib/site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mathivation Research Lab Initiative",
  description: "Bridging abstract mathematics and practical reality.",
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return (
    <PageTransition>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                name: siteConfig.authorName,
                url: siteConfig.siteUrl,
              },
              {
                "@type": "WebSite",
                name: "Mathivation Research Lab Initiative",
                url: siteConfig.siteUrl,
              },
            ],
          }),
        }}
      />
      <LandingHero3D />
    </PageTransition>
  )
}
