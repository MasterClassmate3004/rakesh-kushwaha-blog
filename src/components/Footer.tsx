export default function Footer() {
    return (
        <footer className="mt-4 border-t border-white/10 text-center py-3">
            <p className="text-sm text-muted">
                © {new Date().getFullYear()} Nitya's Blog. Built with Next.js & Framer Motion.
            </p>
        </footer>
    )
}
