import { create } from 'zustand'

interface ThemeState {
    theme: 'light' | 'dark' | 'system'
    resolvedTheme: 'light' | 'dark'
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    toggleTheme: () => void
}

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
    return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(resolved: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', resolved)
}

const saved = (typeof window !== 'undefined' ? localStorage.getItem('medflow-theme') : null) as 'light' | 'dark' | 'system' | null
const initial = saved ?? 'system'
const initialResolved = resolveTheme(initial)

if (typeof window !== 'undefined') {
    applyTheme(initialResolved)
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initial,
    resolvedTheme: initialResolved,

    setTheme: (theme) => {
        const resolved = resolveTheme(theme)
        localStorage.setItem('medflow-theme', theme)
        applyTheme(resolved)
        set({ theme, resolvedTheme: resolved })
    },

    toggleTheme: () => {
        set((state) => {
            const next = state.resolvedTheme === 'light' ? 'dark' : 'light'
            localStorage.setItem('medflow-theme', next)
            applyTheme(next)
            return { theme: next, resolvedTheme: next }
        })
    },
}))

// Listen for system theme changes
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const state = useThemeStore.getState()
        if (state.theme === 'system') {
            const resolved = getSystemTheme()
            applyTheme(resolved)
            useThemeStore.setState({ resolvedTheme: resolved })
        }
    })
}
