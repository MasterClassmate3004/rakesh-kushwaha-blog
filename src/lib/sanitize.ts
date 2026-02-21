const BLOCKED_TAGS = /<(script|style|iframe|object|embed|link|meta|base)\b[^>]*>[\s\S]*?<\/\1>/gi
const BLOCKED_SELF_CLOSING = /<(script|style|iframe|object|embed|link|meta|base)\b[^>]*\/?>/gi
const EVENT_HANDLERS = /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi
const JS_PROTOCOL = /\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi
const DATA_HTML_PROTOCOL = /\s(href|src)\s*=\s*(['"])\s*data:text\/html[\s\S]*?\2/gi
const INLINE_STYLE = /\sstyle\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi

const ALLOWED_TAGS = new Set([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "blockquote",
    "ul",
    "ol",
    "li",
    "hr",
    "br",
    "strong",
    "em",
    "a",
    "span",
    "div",
    "pre",
    "code",
    "img",
])

const ALLOWED_CLASSES = new Set([
    "post-heading",
    "post-subheading",
    "post-body",
    "post-quote",
    "post-list",
    "post-list-ordered",
    "post-callout",
    "post-divider",
    "post-font-serif",
    "post-font-mono",
    "post-color-blue",
    "post-color-muted",
])

export function sanitizeHtml(input: string): string {
    const cleaned = input
        .replace(BLOCKED_TAGS, "")
        .replace(BLOCKED_SELF_CLOSING, "")
        .replace(EVENT_HANDLERS, "")
        .replace(JS_PROTOCOL, "")
        .replace(DATA_HTML_PROTOCOL, "")
        .replace(INLINE_STYLE, "")

    return cleaned.replace(/<(\/?)([a-zA-Z0-9-]+)([^>]*)>/g, (_full, slash: string, rawTag: string, rawAttrs: string) => {
        const tag = rawTag.toLowerCase()
        if (!ALLOWED_TAGS.has(tag)) return ""
        if (slash) return `</${tag}>`

        let attrs = rawAttrs
            .replace(EVENT_HANDLERS, "")
            .replace(JS_PROTOCOL, "")
            .replace(DATA_HTML_PROTOCOL, "")
            .replace(INLINE_STYLE, "")

        attrs = attrs.replace(/\sclass\s*=\s*("([^"]*)"|'([^']*)')/i, (_m, _q, dbl, sgl) => {
            const classValue = (dbl || sgl || "")
                .split(/\s+/)
                .map((c: string) => c.trim())
                .filter((c: string) => ALLOWED_CLASSES.has(c))
                .join(" ")
            return classValue ? ` class="${classValue}"` : ""
        })

        if (tag === "a") {
            const hrefMatch = attrs.match(/\shref\s*=\s*("([^"]*)"|'([^']*)')/i)
            const href = hrefMatch ? (hrefMatch[2] || hrefMatch[3] || "").trim() : ""
            if (!href || (!href.startsWith("https://") && !href.startsWith("http://") && !href.startsWith("/"))) {
                attrs = attrs.replace(/\shref\s*=\s*(".*?"|'.*?')/i, "")
            }
            if (!/\starget\s*=/.test(attrs)) attrs += ' target="_blank"'
            if (!/\srel\s*=/.test(attrs)) attrs += ' rel="noopener noreferrer"'
        } else if (tag === "img") {
            const srcMatch = attrs.match(/\ssrc\s*=\s*("([^"]*)"|'([^']*)')/i)
            const src = srcMatch ? (srcMatch[2] || srcMatch[3] || "").trim() : ""
            if (!src || (!src.startsWith("https://") && !src.startsWith("http://") && !src.startsWith("data:image/"))) {
                return ""
            }
            if (!/\salt\s*=/.test(attrs)) attrs += ' alt="Image"'
        } else {
            attrs = attrs.replace(/\shref\s*=\s*(".*?"|'.*?')/i, "")
            attrs = attrs.replace(/\starget\s*=\s*(".*?"|'.*?')/i, "")
            attrs = attrs.replace(/\srel\s*=\s*(".*?"|'.*?')/i, "")
            attrs = attrs.replace(/\ssrc\s*=\s*(".*?"|'.*?')/i, "")
            attrs = attrs.replace(/\salt\s*=\s*(".*?"|'.*?')/i, "")
        }

        const classMatch = attrs.match(/\sclass\s*=\s*("([^"]*)"|'([^']*)')/i)
        if (classMatch) {
            const classValue = (classMatch[2] || classMatch[3] || "")
                .split(/\s+/)
                .map((c: string) => c.trim())
                .filter((c: string) => ALLOWED_CLASSES.has(c))
                .join(" ")
            attrs = attrs.replace(/\sclass\s*=\s*(".*?"|'.*?')/i, "")
            if (classValue) attrs += ` class="${classValue}"`
        }

        return `<${tag}${attrs}>`
    })
}
