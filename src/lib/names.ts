export const AUTHOR_NAME = "Rakesh Kushwaha"

export function normalizeAuthorName(name?: string | null) {
  if (!name) return AUTHOR_NAME
  return name.trim().toLowerCase() === "admin author" ? AUTHOR_NAME : name
}

