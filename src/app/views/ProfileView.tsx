import { useThemeStore } from '@/shared/stores/theme-store'
import { useAppStore } from '@/shared/stores/app-store'

export function ProfileView() {
    const { resolvedTheme } = useThemeStore()
    const { logout, toast, voice, setVoice } = useAppStore()

    return (
        <div className="animate-view-in">
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{
                    width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: 18,
                    background: 'var(--color-accent-bg)', color: 'var(--color-accent)',
                    border: '2px solid var(--color-accent)',
                }}>
                    SJ
                </div>
                <div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>Sarah Johnson</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>demo@medflow.app</div>
                </div>
            </div>

            <Section title="Notifications">
                <Toggle label="Push reminders" checked={true} onChange={() => toast('Push reminders toggled', 'ts')} />
                <Toggle label="Voice reminders" checked={voice} onChange={() => setVoice(!voice)} />
                <Toggle label="Escalation alerts" checked={true} onChange={() => toast('Escalation alerts toggled', 'ts')} />
            </Section>

            <Section title="Display">
                <Toggle label="Dark mode" checked={resolvedTheme === 'dark'} onChange={() => useThemeStore.getState().toggleTheme()} />
                <Toggle label="Large text" checked={false} onChange={() => toast('Large text — coming soon', 'tw')} />
            </Section>

            <Section title="Subscription">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: 13 }}>Plan</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>Premium</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: 13 }}>Renewal</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-secondary)' }}>Mar 15, 2025</span>
                </div>
            </Section>

            <button onClick={() => { logout(); toast('Signed out', 'ts') }} style={{
                width: '100%', padding: 14, background: 'var(--color-red-bg)',
                border: '1px solid var(--color-red-border)', borderRadius: 12,
                fontSize: 14, fontWeight: 700, color: 'var(--color-red)',
                cursor: 'pointer', marginTop: 20,
            }}>
                Sign Out
            </button>

            <p style={{ marginTop: 20, fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.7, textAlign: 'center' }}>
                Not medical advice. Follow your provider.
            </p>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{title}</h3>
            <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 14, overflow: 'hidden' }}>
                {children}
            </div>
        </div>
    )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--color-border-secondary)' }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            <button onClick={onChange} aria-label={`Toggle ${label}`} style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                background: checked ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                transition: 'background .2s',
            }}>
                <span style={{
                    position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
                    background: '#fff', transition: 'left .2s',
                    left: checked ? 22 : 2,
                }} />
            </button>
        </div>
    )
}
