import { useEffect, useState } from 'react'
import { useAppStore, fT, type SchedItem } from '@/shared/stores/app-store'
import { useTimeline } from '@/shared/hooks/useTimeline'
import { useDoseLogs } from '@/shared/hooks/useDoseLogs'
import { useAuthStore } from '@/shared/stores/auth-store'

const CIRC = 2 * Math.PI * 46

export function TimelineView() {
  const { timeline: sched } = useTimeline()
  const { buildSched } = useAppStore()
  const [, setTick] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      buildSched()
      setTick((t) => t + 1)
    }, 60000)
    return () => clearInterval(iv)
  }, [buildSched])

  const now = new Date()
  const nM = now.getHours() * 60 + now.getMinutes()

  let dn = 0
  let lt = 0
  let ms = 0
  let total = 0

  sched.forEach((i) => {
    if (i.tp !== 'med') return
    total += 1
    if (i.st === 'done') dn += 1
    else if (i.st === 'late') {
      dn += 1
      lt += 1
    } else if (i.st === 'missed') ms += 1
  })

  const pct = total > 0 ? Math.round((dn / total) * 100) : 0
  const ringColor = pct >= 80 ? 'var(--color-ring-green)' : pct >= 50 ? 'var(--color-ring-amber)' : 'var(--color-ring-red)'
  const offset = CIRC - (pct / 100) * CIRC

  return (
    <div className="animate-view-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{now.toLocaleDateString('en-US', { weekday: 'long' })}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-ring-track)" strokeWidth="6" />
            <circle cx="50" cy="50" r="46" fill="none" strokeWidth="6" strokeLinecap="round" stroke={ringColor} strokeDasharray={`${CIRC}`} strokeDashoffset={`${offset}`} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1), stroke .3s' }} />
          </svg>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginTop: -82, position: 'relative', zIndex: 1 }}>{pct}%</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Adherence</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Pill color="var(--color-green)" label={`${dn} Done`} />
        <Pill color="var(--color-amber)" label={`${lt} Late`} />
        <Pill color="var(--color-red)" label={`${ms} Missed`} />
      </div>

      <div style={{ position: 'relative', paddingLeft: 20 }}>
        <div style={{ position: 'absolute', left: 4, top: 12, bottom: 12, width: 1.5, background: 'linear-gradient(to bottom, var(--color-border-primary), transparent)', borderRadius: 1 }} />
        {sched.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>No items for today</div>
        ) : (
          <div className="stagger-children">{sched.map((it) => <TimelineItem key={it.id} item={it} nowMin={nM} />)}</div>
        )}
      </div>
    </div>
  )
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-primary)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </div>
  )
}

function TimelineItem({ item: it, nowMin }: { item: SchedItem; nowMin: number }) {
  const { toast, setTab } = useAppStore()
  const [open, setOpen] = useState(false)

  const borderStyle = '1px solid var(--color-border-secondary)'
  let bg = 'var(--color-bg-secondary)'
  let dotColor = 'var(--color-text-tertiary)'
  let dotRadius = '50%'
  let tag: React.ReactNode = null
  let opacity = 1

  if (it.tp === 'med') {
    if (it.st === 'done') { dotColor = 'var(--color-green)'; opacity = 0.55; tag = <Tag bg="var(--color-green-bg)" color="var(--color-green)" border="var(--color-green-border)" label="Done" /> }
    else if (it.st === 'late') { dotColor = 'var(--color-amber)'; opacity = 0.6; tag = <Tag bg="var(--color-amber-bg)" color="var(--color-amber)" border="var(--color-amber-border)" label="Late" /> }
    else if (it.st === 'missed') { dotColor = 'var(--color-red)'; bg = 'var(--color-red-bg)'; tag = <Tag bg="var(--color-red-bg)" color="var(--color-red)" border="var(--color-red-border)" label="Missed" /> }
    else if (it.nx) { dotColor = 'var(--color-amber)'; bg = 'var(--color-amber-bg)'; tag = <Tag bg="var(--color-amber-bg)" color="var(--color-amber)" border="var(--color-amber-border)" label="Next" /> }
  } else if (it.tp === 'food') {
    dotColor = 'var(--color-amber)'
    bg = 'var(--color-amber-bg)'
    dotRadius = '1px'
    tag = <Tag bg="var(--color-amber-bg)" color="var(--color-amber)" border="var(--color-amber-border)" label="Food" dashed />
  } else if (it.tp === 'appt') {
    dotColor = 'var(--color-text-primary)'
    dotRadius = '2px'
    tag = <Tag bg="var(--color-bg-tertiary)" color="var(--color-text-secondary)" border="var(--color-border-primary)" label="Appt" />
  }

  const borderLeft = it.st === 'done'
    ? '3px solid var(--color-green)'
    : it.st === 'late'
      ? '3px solid var(--color-amber)'
      : it.st === 'missed'
        ? '3px solid var(--color-red)'
        : it.nx
          ? '3px solid var(--color-amber)'
          : it.tp === 'food'
            ? '3px dashed var(--color-amber-border)'
            : it.tp === 'appt'
              ? '3px solid var(--color-text-primary)'
              : 'none'

  const handleClick = () => {
    if (it.tp === 'med' && (it.st === 'pending' || it.nx)) setOpen(true)
    else if (it.tp === 'appt') setTab('appts')
    else if (it.st === 'done' || it.st === 'late') toast(`${it.name} - already confirmed`, 'ts')
  }

  return (
    <>
      <div className="animate-slide-r card-interactive" onClick={handleClick} style={{ position: 'relative', marginBottom: 6, padding: '12px 14px', background: bg, border: borderStyle, borderLeft, borderRadius: 12, cursor: 'pointer', opacity }}>
        <div style={{ position: 'absolute', left: -20, top: 18, width: 9, height: 9, background: dotColor, border: '2px solid var(--color-bg-primary)', borderRadius: dotRadius, zIndex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 60, paddingTop: 1 }}>{fT(it.time)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.inst || ''}</div>
          </div>
          {tag}
        </div>
      </div>
      {open && <DoseModal item={it} onClose={() => setOpen(false)} nowMin={nowMin} />}
    </>
  )
}

function Tag({ bg, color, border, label, dashed }: { bg: string; color: string; border: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'flex-start', background: bg, color, border: `1px ${dashed ? 'dashed' : 'solid'} ${border}` }}>
      {label}
    </span>
  )
}

function DoseModal({ item: it, onClose, nowMin }: { item: SchedItem; onClose: () => void; nowMin: number }) {
  const { isDemo } = useAuthStore()
  const { markDone: markDoneDemo, markMissed: markMissedDemo, toast } = useAppStore()
  const { logDose } = useDoseLogs()

  const markDone = () => {
    if (isDemo) {
      markDoneDemo(it.id)
      return
    }
    if (!it.mid) return

    const late = nowMin > it.tm + 15
    logDose({
      medication_id: it.mid,
      schedule_id: it.id,
      taken_at: new Date().toISOString(),
      status: late ? 'late' : 'taken',
      notes: null,
    })
  }

  const markMissed = () => {
    if (isDemo) {
      markMissedDemo(it.id)
      return
    }
    if (!it.mid) return

    logDose({
      medication_id: it.mid,
      schedule_id: it.id,
      taken_at: new Date().toISOString(),
      status: 'missed',
      notes: null,
    })
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'var(--color-overlay)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, maxHeight: '88vh', background: 'var(--color-bg-primary)', borderRadius: '16px 16px 0 0', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: 'var(--color-text-tertiary)', opacity: 0.3, margin: '10px auto', borderRadius: 4 }} />
        <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-primary)' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Medication</h3>
          <button onClick={onClose} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', borderRadius: '50%' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{fT(it.time)}</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 3 }}>{it.name} {it.dose || ''}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>{it.inst || ''}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => { markDone(); onClose() }} style={{ width: '100%', padding: 14, fontSize: 14, fontWeight: 700, borderRadius: 12, cursor: 'pointer', border: 'none', background: 'var(--color-green)', color: '#fff' }}>Mark Done</button>
            <button onClick={() => { toast(`${it.name} snoozed`, 'tw'); onClose() }} style={{ width: '100%', padding: 14, fontSize: 14, fontWeight: 700, borderRadius: 12, cursor: 'pointer', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1.5px solid var(--color-border-primary)' }}>Snooze</button>
            <button onClick={() => { markMissed(); onClose() }} style={{ background: 'transparent', color: 'var(--color-red)', border: 'none', fontSize: 12, fontWeight: 600, padding: 10, cursor: 'pointer' }}>Mark as Missed</button>
          </div>
        </div>
      </div>
    </div>
  )
}
