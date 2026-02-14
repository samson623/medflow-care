import { useState } from 'react'
import { useThemeStore } from '@/shared/stores/theme-store'
import { useAppStore } from '@/shared/stores/app-store'

export function LoginScreen() {
    const [email, setEmail] = useState('demo@medflow.app')
    const [pass, setPass] = useState('123456')
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)
    const { toggleTheme } = useThemeStore()
    const { login, toast } = useAppStore()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email.trim() === 'demo@medflow.app' && pass === '123456') {
            setError(false)
            login()
            toast('Signed in', 'ts')
        } else {
            setError(true)
            setShake(true)
            setTimeout(() => setShake(false), 400)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'var(--color-bg-primary)',
        }}>
            <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{
                    position: 'absolute', top: 20, right: 20, width: 40, height: 40,
                    background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-primary)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--color-text-secondary)',
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            </button>

            <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>MedFlow</h1>
                    <span className="animate-dot-pulse" style={{ width: 8, height: 8, background: 'var(--color-accent)', borderRadius: 2 }} />
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 40, fontWeight: 400 }}>
                    Stay on time. Stay safe. Stay confident.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} autoComplete="off">
                    {error && (
                        <div className="animate-fade-in" style={{
                            background: 'var(--color-red-bg)', border: '1px solid var(--color-red-border)',
                            color: 'var(--color-red)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                        }}>
                            Invalid credentials. Please try again.
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="demo@medflow.app"
                            style={{
                                width: '100%', padding: '13px 14px', background: 'var(--color-bg-tertiary)',
                                border: '1.5px solid var(--color-border-primary)', color: 'var(--color-text-primary)',
                                fontSize: 15, borderRadius: 10, outline: 'none',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                            placeholder="Enter password"
                            style={{
                                width: '100%', padding: '13px 14px', background: 'var(--color-bg-tertiary)',
                                border: '1.5px solid var(--color-border-primary)', color: 'var(--color-text-primary)',
                                fontSize: 15, borderRadius: 10, outline: 'none',
                            }}
                        />
                    </div>

                    <button type="submit" className={shake ? 'animate-shake' : ''} style={{
                        width: '100%', padding: 14, background: 'var(--color-accent)', color: '#fff',
                        border: 'none', fontSize: 14, fontWeight: 700, letterSpacing: '0.02em',
                        cursor: 'pointer', borderRadius: 10,
                    }}>
                        Sign In
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0', color: 'var(--color-text-tertiary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <span style={{ flex: 1, height: 1, background: 'var(--color-border-primary)' }} />
                        <span>or</span>
                        <span style={{ flex: 1, height: 1, background: 'var(--color-border-primary)' }} />
                    </div>

                    <button type="button" onClick={() => useAppStore.getState().toast('Google Sign-In — demo placeholder', 'tw')} style={{
                        width: '100%', padding: 12, background: 'transparent',
                        border: '1.5px solid var(--color-border-primary)', color: 'var(--color-text-secondary)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <p style={{ marginTop: 10, textAlign: 'center', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                        Demo: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-tertiary)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>demo@medflow.app</code> / <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-bg-tertiary)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>123456</code>
                    </p>
                </form>

                <p style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--color-border-primary)', fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.7 }}>
                    This app assists with medication tracking and reminders. It does not provide medical advice. Always follow instructions from your healthcare provider.
                </p>
            </div>
        </div>
    )
}
