import { useState, useRef } from 'react'
import { useThemeStore } from '@/shared/stores/theme-store'
import { useAppStore, type Tab } from '@/shared/stores/app-store'
import { LoginScreen } from '@/app/LoginScreen'
import { TimelineView } from '@/app/views/TimelineView'
import { MedsView } from '@/app/views/MedsView'
import { ApptsView } from '@/app/views/ApptsView'
import { SummaryView } from '@/app/views/SummaryView'
import { ProfileView } from '@/app/views/ProfileView'

// ===== TAB CONFIG =====
const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { id: 'timeline', label: 'Timeline', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { id: 'meds', label: 'Meds', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 2h6a2 2 0 012 2v1H7V4a2 2 0 012-2z" /><rect x="7" y="5" width="10" height="16" rx="2" /></svg> },
    { id: 'appts', label: 'Appts', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: 'summary', label: 'Summary', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg> },
]

export function App() {
    const { loggedIn, tab, setTab, toasts, showProfile, setShowProfile } = useAppStore()
    const { resolvedTheme, toggleTheme } = useThemeStore()
    const [notifOpen, setNotifOpen] = useState(false)
    const [voiceActive, setVoiceActive] = useState(false)
    const [voiceBubble, setVoiceBubble] = useState('')
    const recognitionRef = useRef<any>(null)

    if (!loggedIn) return (
        <>
            <LoginScreen />
            <Toasts toasts={toasts} />
        </>
    )

    const view = showProfile ? <ProfileView />
        : tab === 'timeline' ? <TimelineView />
            : tab === 'meds' ? <MedsView />
                : tab === 'appts' ? <ApptsView />
                    : <SummaryView />

    const handleVoice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            useAppStore.getState().toast('Speech recognition not supported', 'te')
            return
        }
        if (voiceActive) {
            recognitionRef.current?.stop()
            setVoiceActive(false)
            setVoiceBubble('')
            return
        }
        const rec = new SpeechRecognition()
        rec.continuous = false; rec.interimResults = true; rec.lang = 'en-US'
        recognitionRef.current = rec
        setVoiceActive(true); setVoiceBubble('Listening...')
        rec.onresult = (e: any) => {
            const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
            setVoiceBubble(t || 'Listening...')
            if (e.results[0].isFinal) {
                processVoice(t)
                setTimeout(() => { setVoiceActive(false); setVoiceBubble('') }, 1500)
            }
        }
        rec.onerror = () => { setVoiceActive(false); setVoiceBubble('') }
        rec.onend = () => { setVoiceActive(false); setVoiceBubble('') }
        rec.start()
    }

    const processVoice = (text: string) => {
        const store = useAppStore.getState()
        const t = text.toLowerCase()
        if (t.includes('medication') || t.includes('meds')) { store.setTab('meds'); store.toast('Showing medications', 'ts') }
        else if (t.includes('appointment') || t.includes('appt')) { store.setTab('appts'); store.toast('Showing appointments', 'ts') }
        else if (t.includes('summary')) { store.setTab('summary'); store.toast('Showing summary', 'ts') }
        else if (t.includes('timeline') || t.includes('schedule')) { store.setTab('timeline'); store.toast('Showing timeline', 'ts') }
        else { store.toast(`"${text}" — command not recognized`, 'tw') }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
            {/* HEADER */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'var(--color-header-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--color-border-secondary)',
            }}>
                <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }} onClick={() => { setTab('timeline'); setShowProfile(false) }}>
                        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>MedFlow</span>
                        <span className="animate-dot-pulse" style={{ width: 5, height: 5, borderRadius: 1, background: 'var(--color-accent)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                        <HBtn onClick={toggleTheme} label="Toggle theme">
                            {resolvedTheme === 'dark'
                                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                            }
                        </HBtn>
                        <HBtn onClick={() => setNotifOpen(!notifOpen)} label="Notifications" badge>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                        </HBtn>
                        <HBtn onClick={() => setShowProfile(!showProfile)} label="Profile">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </HBtn>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main style={{ flex: 1, maxWidth: 480, margin: '0 auto', width: '100%', padding: '16px 16px 100px' }}>
                {view}
            </main>

            {/* BOTTOM NAV */}
            <nav style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
                background: 'var(--color-nav-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--color-border-secondary)',
            }}>
                <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', height: 58 }}>
                    {tabs.map(t => {
                        const active = !showProfile && tab === t.id
                        return (
                            <button key={t.id} onClick={() => { setTab(t.id); setShowProfile(false) }}
                                className="tap-spring"
                                style={{
                                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                                    position: 'relative',
                                }}
                            >
                                {active && <span style={{ position: 'absolute', top: -1, width: 24, height: 2, borderRadius: 2, background: 'var(--color-accent)' }} />}
                                {t.icon(active)}
                                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{t.label}</span>
                            </button>
                        )
                    })}
                </div>
            </nav>

            {/* VOICE FAB */}
            <button onClick={handleVoice}
                className={voiceActive ? 'animate-vpulse' : ''}
                style={{
                    position: 'fixed', right: 20, bottom: 74, zIndex: 200,
                    width: 48, height: 48, borderRadius: '50%',
                    background: voiceActive ? 'var(--color-red)' : 'var(--color-text-primary)',
                    color: voiceActive ? '#fff' : 'var(--color-text-inverse)',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-lg)', transition: 'background .2s',
                }}
                aria-label="Voice commands"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M19 10v1a7 7 0 01-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            </button>

            {/* Voice Bubble */}
            {voiceBubble && (
                <div className="animate-fade-in" style={{
                    position: 'fixed', right: 76, bottom: 80, zIndex: 200,
                    background: 'var(--color-text-primary)', color: 'var(--color-text-inverse)',
                    padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    maxWidth: 200, boxShadow: 'var(--shadow-lg)',
                }}>
                    {voiceBubble}
                </div>
            )}

            {/* NOTIFICATIONS PANEL */}
            {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}

            {/* TOASTS */}
            <Toasts toasts={toasts} />
        </div>
    )
}

// ===== SUB COMPONENTS =====
function HBtn({ onClick, label, badge, children }: { onClick: () => void; label: string; badge?: boolean; children: React.ReactNode }) {
    return (
        <button onClick={onClick} aria-label={label} className="tap-spring"
            style={{
                width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', position: 'relative',
            }}
        >
            {children}
            {badge && <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-red)', border: '2px solid var(--color-bg-primary)' }} />}
        </button>
    )
}

function Toasts({ toasts }: { toasts: { id: string; msg: string; cls: string }[] }) {
    if (!toasts.length) return null
    const bc: Record<string, string> = { ts: 'var(--color-green)', tw: 'var(--color-amber)', te: 'var(--color-red)' }
    return (
        <div style={{ position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6, width: '90%', maxWidth: 400 }}>
            {toasts.map(t => (
                <div key={t.id} className="animate-toast" style={{
                    background: 'var(--color-text-primary)', color: 'var(--color-text-inverse)',
                    padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    borderLeft: `3px solid ${bc[t.cls] || bc.ts}`, boxShadow: 'var(--shadow-elevated)',
                }}>
                    {t.msg}
                </div>
            ))}
        </div>
    )
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
    const notifs = [
        { icon: '⏰', msg: 'Levothyroxine — 8:00 AM', sub: 'Take on empty stomach', time: '5m ago' },
        { icon: '✓', msg: 'Metformin logged', sub: 'Taken at 8:32 AM', time: '28m ago' },
        { icon: '⚠', msg: 'Lisinopril supply low', sub: '8 pills remaining', time: '2h ago' },
        { icon: '📅', msg: 'Dr. Chen — Today at 3:30 PM', sub: 'City Medical Center', time: '4h ago' },
    ]

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'var(--color-overlay)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} className="animate-view-in" style={{
                width: '100%', maxWidth: 480, maxHeight: '70vh', background: 'var(--color-bg-primary)',
                borderRadius: '16px 16px 0 0', overflowY: 'auto',
            }}>
                <div style={{ width: 36, height: 4, background: 'var(--color-text-tertiary)', opacity: 0.3, margin: '10px auto', borderRadius: 4 }} />
                <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-primary)' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>Notifications</h3>
                    <button onClick={onClose} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', borderRadius: '50%' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>
                <div style={{ padding: '10px 20px' }}>
                    {notifs.map((n, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border-secondary)' }}>
                            <span style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>{n.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{n.msg}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{n.sub}</div>
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{n.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
