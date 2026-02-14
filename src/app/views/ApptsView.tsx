import { useState } from 'react'
import { useAppStore, fT, fD } from '@/shared/stores/app-store'

export function ApptsView() {
    const { appts, toast } = useAppStore()
    const [showAdd, setShowAdd] = useState(false)

    const sorted = [...appts].sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())

    return (
        <div className="animate-view-in">
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--color-text-primary)' }}>
                Appointments
            </h2>

            <div className="stagger-children">
                {sorted.map((a, i) => {
                    const past = new Date(a.date + 'T' + a.time) < new Date()
                    return (
                        <div key={a.id} className="animate-slide-r card-interactive"
                            onClick={() => toast(`${a.title} — ${fD(a.date)}`, 'ts')}
                            style={{
                                background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-secondary)',
                                borderLeft: '3px solid var(--color-text-primary)', borderRadius: 14, padding: 14,
                                marginBottom: 8, cursor: 'pointer', opacity: past ? 0.45 : 1,
                                animationDelay: `${i * 0.04}s`,
                            }}
                        >
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>
                                {fD(a.date)} at {fT(a.time)}
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{a.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {a.loc}
                            </div>
                            {a.notes.length > 0 && (
                                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--color-border-primary)' }}>
                                    {a.notes.map((n, j) => (
                                        <div key={j} style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 3, paddingLeft: 10, position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 0, top: 7, width: 4, height: 4, background: 'var(--color-text-tertiary)', borderRadius: 1 }} />
                                            {n}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <button onClick={() => setShowAdd(true)} style={{
                width: '100%', padding: 14, background: 'transparent', border: '2px dashed var(--color-border-primary)',
                borderRadius: 14, fontSize: 14, fontWeight: 700, color: 'var(--color-text-tertiary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10,
            }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Appointment
            </button>

            {showAdd && <AddApptModal onClose={() => setShowAdd(false)} />}
        </div>
    )
}

function AddApptModal({ onClose }: { onClose: () => void }) {
    const { addAppt } = useAppStore()
    const today = new Date().toISOString().split('T')[0]
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(today)
    const [time, setTime] = useState('14:00')
    const [loc, setLoc] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addAppt({ title, date, time, loc, notes: notes.trim() ? notes.split('\n').filter(Boolean) : [] })
        onClose()
    }

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'var(--color-overlay)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, maxHeight: '88vh', background: 'var(--color-bg-primary)', borderRadius: '16px 16px 0 0', overflowY: 'auto' }}>
                <div style={{ width: 36, height: 4, background: 'var(--color-text-tertiary)', opacity: 0.3, margin: '10px auto', borderRadius: 4 }} />
                <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-primary)' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>Add Appointment</h3>
                    <button onClick={onClose} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', borderRadius: '50%' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>
                <div style={{ padding: 20 }}>
                    <form onSubmit={handleSubmit}>
                        <FG label="Title"><input className="fi" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Dr. Chen — Cardiology" /></FG>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <FG label="Date"><input className="fi" type="date" value={date} onChange={e => setDate(e.target.value)} required /></FG>
                            <FG label="Time"><input className="fi" type="time" value={time} onChange={e => setTime(e.target.value)} required /></FG>
                        </div>
                        <FG label="Location"><input className="fi" value={loc} onChange={e => setLoc(e.target.value)} placeholder="e.g. City Medical Center" /></FG>
                        <FG label="Notes"><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. bring medication list, fasting required"
                            style={{ width: '100%', height: 80, padding: 12, background: 'var(--color-input-bg)', border: '1.5px solid var(--color-border-primary)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-primary)', resize: 'none', outline: 'none' }}
                        /></FG>
                        <button type="submit" style={{ width: '100%', padding: 14, background: 'var(--color-accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 12, marginTop: 6 }}>
                            Add Appointment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

function FG({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 14, flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
            {children}
        </div>
    )
}
