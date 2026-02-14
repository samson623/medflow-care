import { useEffect, useState } from 'react'
import { useAppStore, fT, type SchedItem } from '@/shared/stores/app-store'

const CIRC = 2 * Math.PI * 46

export function TimelineView() {
    const { sched, buildSched } = useAppStore()
    const [, setTick] = useState(0)

    useEffect(() => {
        buildSched()
        const iv = setInterval(() => { buildSched(); setTick(t => t + 1) }, 60000)
        return () => clearInterval(iv)
    }, [buildSched])

    const now = new Date()
    const nM = now.getHours() * 60 + now.getMinutes()
    const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dy = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    let dn = 0, lt = 0, ms = 0, total = 0
    sched.forEach(i => {
        if (i.tp !== 'med') return
        total++
        if (i.st === 'done') dn++
        else if (i.st === 'late') { dn++; lt++ }
        else if (i.st === 'missed') ms++
    })
    const pct = total > 0 ? Math.round((dn / total) * 100) : 0
    const ringColor = pct >= 80 ? 'var(--color-ring-green)' : pct >= 50 ? 'var(--color-ring-amber)' : 'var(--color-ring-red)'
    const offset = CIRC - (pct / 100) * CIRC

    return (
        <div className="animate-view-in">
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{mo[now.getMonth()]} {now.getDate()}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{dy[now.getDay()]}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-ring-track)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="46" fill="none" strokeWidth="6" strokeLinecap="round"
                            stroke={ringColor} strokeDasharray={`${CIRC}`} strokeDashoffset={`${offset}`}
                            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1), stroke .3s' }} />
                    </svg>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginTop: -82, position: 'relative', zIndex: 1 }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Adherence</div>
                </div>
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <Pill color="var(--color-green)" label={`${dn} Done`} />
                <Pill color="var(--color-amber)" label={`${lt} Late`} />
                <Pill color="var(--color-red)" label={`${ms} Missed`} />
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{
                    position: 'absolute', left: 4, top: 12, bottom: 12, width: 1.5,
                    background: 'linear-gradient(to bottom, var(--color-border-primary), transparent)', borderRadius: 1,
                }} />
                <div className="stagger-children">
                    {sched.map(it => <TimelineItem key={it.id} item={it} nowMin={nM} />)}
                </div>
            </div>
        </div>
    )
}

function Pill({ color, label }: { color: string; label: string }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-primary)',
            borderRadius: 20, fontSize: 12, fontWeight: 600,
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
            {label}
        </div>
    )
}

function TimelineItem({ item: it, nowMin }: { item: SchedItem; nowMin: number }) {
    const { toast } = useAppStore()
    const [open, setOpen] = useState(false)

    let borderStyle = '1px solid var(--color-border-secondary)'
    let bg = 'var(--color-bg-secondary)'
    let dotColor = 'var(--color-text-tertiary)'
    let dotRadius = '50%'
    let tag: React.ReactNode = null
    let opacity = 1

    if (it.tp === 'med') {
        if (it.st === 'done') { borderStyle = ''; bg = 'var(--color-bg-secondary)'; dotColor = 'var(--color-green)'; opacity = 0.55; tag = <Tag bg="var(--color-green-bg)" color="var(--color-green)" border="var(--color-green-border)" label="Done" /> }
        else if (it.st === 'late') { dotColor = 'var(--color-amber)'; opacity = 0.6; tag = <Tag bg="var(--color-amber-bg)" color="var(--color-amber)" border="var(--color-amber-border)" label="Late" /> }
        else if (it.st === 'missed') { dotColor = 'var(--color-red)'; bg = 'var(--color-red-bg)'; tag = <Tag bg="var(--color-red-bg)" color="var(--color-red)" border="var(--color-red-border)" label="Missed" /> }
        else if (it.nx) { dotColor = 'var(--color-amber)'; bg = 'var(--color-amber-bg)'; tag = <Tag bg="var(--color-amber-bg)" color="var(--color-amber)" border="var(--color-amber-border)" label="Next" /> }
    } else if (it.tp === 'food') {
        dotColor = 'var(--color-amber)'; bg = 'var(--color-amber-bg)'; dotRadius = '1px'
        tag = <Tag bg="var(--color-amber-bg)" color="var(--color-amber)" border="var(--color-amber-border)" label="Food" dashed />
    } else if (it.tp === 'appt') {
        dotColor = 'var(--color-text-primary)'; dotRadius = '2px'
        tag = <Tag bg="var(--color-bg-tertiary)" color="var(--color-text-secondary)" border="var(--color-border-primary)" label="Appt" />
    }

    const borderLeft = it.st === 'done' ? '3px solid var(--color-green)'
        : it.st === 'late' ? '3px solid var(--color-amber)'
            : it.st === 'missed' ? '3px solid var(--color-red)'
                : it.nx ? '3px solid var(--color-amber)'
                    : it.tp === 'food' ? '3px dashed var(--color-amber-border)'
                        : it.tp === 'appt' ? '3px solid var(--color-text-primary)'
                            : 'none'

    // Food timer
    let foodExtra: React.ReactNode = null
    if (it.tp === 'food' && it.ws && it.wm) {
        const s = tM(it.ws), e = it.tm
        if (nowMin >= s && nowMin < e) {
            const r = e - nowMin
            const p = ((nowMin - s) / (e - s)) * 100
            foodExtra = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 11, fontWeight: 700, color: 'var(--color-amber)' }}>
                    {r} min left
                    <div style={{ flex: 1, height: 3, background: 'var(--color-amber-bg)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: 'var(--color-amber)', borderRadius: 2, transition: 'width 1s linear' }} />
                    </div>
                </div>
            )
        } else if (nowMin >= e) {
            foodExtra = <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 11, fontWeight: 700, color: 'var(--color-green)' }}>Safe to eat now</div>
        } else {
            foodExtra = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 11, fontWeight: 700, color: 'var(--color-amber)' }}>
                    Do not eat yet
                    <div style={{ flex: 1, height: 3, background: 'var(--color-amber-bg)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '0%', background: 'var(--color-amber)', borderRadius: 2 }} />
                    </div>
                </div>
            )
        }
    }

    const handleClick = () => {
        if (it.tp === 'med' && (it.st === 'pending' || it.nx)) setOpen(true)
        else if (it.tp === 'appt') useAppStore.getState().setTab('appts')
        else if (it.st === 'done' || it.st === 'late') toast(`${it.name} — already confirmed`, 'ts')
    }

    return (
        <>
            <div
                className="animate-slide-r card-interactive"
                onClick={handleClick}
                style={{
                    position: 'relative', marginBottom: 6, padding: '12px 14px',
                    background: bg, border: borderStyle, borderLeft, borderRadius: 12,
                    cursor: 'pointer', opacity,
                }}
            >
                {/* Dot */}
                <div style={{
                    position: 'absolute', left: -20, top: 18, width: 9, height: 9,
                    background: dotColor, border: '2px solid var(--color-bg-primary)',
                    borderRadius: dotRadius, zIndex: 1,
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 60, paddingTop: 1, letterSpacing: '0.02em' }}>
                        {fT(it.time)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.inst || ''}</div>
                        {foodExtra}
                    </div>
                    {tag}
                </div>
            </div>

            {open && <DoseModal item={it} onClose={() => setOpen(false)} />}
        </>
    )
}

function Tag({ bg, color, border, label, dashed }: { bg: string; color: string; border: string; label: string; dashed?: boolean }) {
    return (
        <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'flex-start',
            background: bg, color, border: `1px ${dashed ? 'dashed' : 'solid'} ${border}`,
        }}>
            {label}
        </span>
    )
}

// ===== DOSE MODAL =====
function DoseModal({ item: it, onClose }: { item: SchedItem; onClose: () => void }) {
    const [showSnooze, setShowSnooze] = useState(false)
    const [showNote, setShowNote] = useState(false)
    const [noteText, setNoteText] = useState('')
    const { markDone, markMissed, addNote, toast } = useAppStore()
    const med = useAppStore(s => s.meds.find(m => m.id === it.mid))

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, zIndex: 500, background: 'var(--color-overlay)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: 480, maxHeight: '88vh', background: 'var(--color-bg-primary)',
                borderRadius: '16px 16px 0 0', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
            }}>
                <div style={{ width: 36, height: 4, background: 'var(--color-text-tertiary)', opacity: 0.3, margin: '10px auto', borderRadius: 4 }} />
                <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-primary)' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>Medication</h3>
                    <button onClick={onClose} style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--color-bg-tertiary)', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-secondary)', borderRadius: '50%',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div style={{ padding: 20 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{fT(it.time)}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 3 }}>{it.name} {it.dose || ''}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>{it.inst || ''}</div>

                    {med?.warn && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12,
                            background: 'var(--color-amber-bg)', border: '1px solid var(--color-amber-border)',
                            borderRadius: 10, fontSize: 13, marginBottom: 16,
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <span>{med.warn}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button onClick={() => { markDone(it.id); onClose() }} style={{
                            width: '100%', padding: 14, fontSize: 14, fontWeight: 700, borderRadius: 12,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            border: 'none', background: 'var(--color-green)', color: '#fff',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                            Mark Done
                        </button>

                        <button onClick={() => { setShowSnooze(!showSnooze); setShowNote(false) }} style={{
                            width: '100%', padding: 14, fontSize: 14, fontWeight: 700, borderRadius: 12,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                            border: '1.5px solid var(--color-border-primary)',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            Snooze
                        </button>

                        {showSnooze && (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                                {['10 minutes', '30 minutes', '1 hour', 'after meal', 'custom time'].map(s => (
                                    <button key={s} onClick={() => { toast(`${it.name} snoozed — ${s}`, 'tw'); onClose() }} style={{
                                        padding: '12px 14px', background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border-secondary)', borderRadius: 10,
                                        fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                                        cursor: 'pointer', textAlign: 'left',
                                    }}>
                                        Remind in {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button onClick={() => { setShowNote(!showNote); setShowSnooze(false) }} style={{
                            width: '100%', padding: 14, fontSize: 14, fontWeight: 700, borderRadius: 12,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            background: 'transparent', color: 'var(--color-text-secondary)',
                            border: '1.5px dashed var(--color-border-primary)',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Add Note
                        </button>

                        {showNote && (
                            <div className="animate-fade-in" style={{ marginTop: 8 }}>
                                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="e.g. mild dizziness, questions for doctor..."
                                    style={{
                                        width: '100%', height: 80, padding: 12, background: 'var(--color-input-bg)',
                                        border: '1.5px solid var(--color-border-primary)', borderRadius: 10,
                                        fontSize: 13, color: 'var(--color-text-primary)', resize: 'none', outline: 'none',
                                    }}
                                />
                                <button onClick={() => { if (noteText.trim() && it.mid) { addNote(it.mid, noteText.trim()); setNoteText(''); setShowNote(false) } }}
                                    style={{
                                        marginTop: 8, padding: '10px 20px', background: 'var(--color-text-primary)',
                                        color: 'var(--color-text-inverse)', border: 'none', fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', borderRadius: 8,
                                    }}>
                                    Save Note
                                </button>
                            </div>
                        )}

                        <button onClick={() => { markMissed(it.id); onClose() }} style={{
                            background: 'transparent', color: 'var(--color-red)', border: 'none',
                            fontSize: 12, fontWeight: 600, padding: 10, cursor: 'pointer',
                        }}>
                            Mark as Missed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function tM(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
}
