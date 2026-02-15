import { useAppStore } from '@/shared/stores/app-store'
import { useAuthStore } from '@/shared/stores/auth-store'
import { useTimeline } from '@/shared/hooks/useTimeline'
import { useNotes } from '@/shared/hooks/useNotes'

export function SummaryView() {
  const { isDemo } = useAuthStore()
  const { sched: demoSched, notes: demoNotes, adh } = useAppStore()
  const { timeline } = useTimeline()
  const { notes: realNotes } = useNotes()

  const sched = isDemo ? demoSched : timeline

  let dn = 0
  let lt = 0
  let ms = 0
  let total = 0

  sched.forEach((i) => {
    if (i.tp !== 'med') return
    total += 1
    if (i.st === 'done') dn += 1
    else if (i.st === 'late') { dn += 1; lt += 1 }
    else if (i.st === 'missed') ms += 1
  })

  const days: { label: string; pct: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const label = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]
    const pct = isDemo
      ? (adh[key] ? Math.round((adh[key].d / adh[key].t) * 100) : i === 0 && total > 0 ? Math.round((dn / total) * 100) : 0)
      : (i === 0 && total > 0 ? Math.round((dn / total) * 100) : 0)
    days.push({ label, pct })
  }

  const notes = isDemo
    ? demoNotes.map((n) => ({ id: n.id, title: n.mid, text: n.text, created: n.time }))
    : realNotes.map((n) => ({ id: n.id, title: 'Note', text: n.content, created: n.created_at }))

  return (
    <div className="animate-view-in">
      <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--color-text-primary)' }}>
        Daily Summary
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        <StatCard n={dn} label="Completed" color="var(--color-green)" />
        <StatCard n={lt} label="Late" color="var(--color-amber)" />
        <StatCard n={ms} label="Missed" color="var(--color-red)" />
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>7-Day Adherence</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, paddingBottom: 20, position: 'relative' }}>
          {days.map((d, i) => {
            const bc = d.pct >= 80 ? 'var(--color-green)' : d.pct >= 50 ? 'var(--color-amber)' : d.pct > 0 ? 'var(--color-red)' : 'var(--color-ring-track)'
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4, position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', fontWeight: 700 }}>{d.pct}%</div>
                <div style={{ width: '100%', background: bc, borderRadius: 4, minHeight: 3, height: `${Math.max(d.pct * 0.7, 3)}%` }} />
                <div style={{ position: 'absolute', bottom: 0, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: i === 6 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>{d.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 14, padding: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Recent Notes</h3>
        {notes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>No notes yet.</p>
        ) : (
          notes.slice(0, 5).map((n) => (
            <div key={n.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-border-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{new Date(n.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{n.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StatCard({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 14, padding: 14, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color }}>{n}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  )
}