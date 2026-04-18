export default function Footer() {
    return (
        <footer className="mt-4 border-t border-white/10 text-center py-3">
            <p className="text-sm text-muted">
                © {new Date().getFullYear()} Mathivation Research Lab — teaching life one lesson at a time.
            </p>
        </footer>
    )
}
