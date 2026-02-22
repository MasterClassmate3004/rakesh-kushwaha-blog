"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeContextValue = {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "theme"

function applyTheme(theme: Theme) {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark")

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        const initialTheme: Theme = stored === "light" ? "light" : "dark"
        setThemeState(initialTheme)
        applyTheme(initialTheme)
    }, [])

    const setTheme = (nextTheme: Theme) => {
        setThemeState(nextTheme)
        applyTheme(nextTheme)
        localStorage.setItem(STORAGE_KEY, nextTheme)
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const value = {
        theme,
        setTheme,
        toggleTheme,
    }

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider")
    }
    return context
}
