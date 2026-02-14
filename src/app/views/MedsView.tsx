import { useState } from 'react'
import { useAppStore, fT } from '@/shared/stores/app-store'

export function MedsView() {
    const { meds, toast } = useAppStore()
    const [showAdd, setShowAdd] = useState(false)

    return (
        <div className="animate-view-in">
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--color-text-primary)' }}>
                Medications
            </h2>

            <div className="stagger-children">
                {meds.map((m, i) => {
                    const p = m.tot > 0 ? (m.sup / m.tot) * 100 : 0
                    const days = m.dpd > 0 ? Math.floor(m.sup / m.dpd) : 0
                    const sc = p < 20 ? 'var(--color-red)' : p < 40 ? 'var(--color-amber)' : 'var(--color-green)'

                    return (
                        <div key={m.id} className="animate-slide-r card-interactive"
                            onClick={() => toast(`${m.name} — ${m.inst}`, 'ts')}
                            style={{
                                background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-secondary)',
                                borderRadius: 14, padding: 14, marginBottom: 8, cursor: 'pointer',
                                animationDelay: `${i * 0.04}s`,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-tertiary)', padding: '2px 8px', borderRadius: 6 }}>{m.dose}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    {m.times.map(fT).join(', ')}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
                                    {m.freq}x daily
                                </span>
                            </div>
                            <div style={{ marginTop: 8, height: 4, background: 'var(--color-ring-track)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 4, width: `${p}%`, background: sc, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                                <span>{m.sup} pills left</span>
                                <span>{days} days{days <= 5 ? ' — Refill soon' : ''}</span>
                            </div>
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
                Add Medication
            </button>

            {showAdd && <AddMedModal onClose={() => setShowAdd(false)} />}
        </div>
    )
}

function AddMedModal({ onClose }: { onClose: () => void }) {
    const { addMed, toast } = useAppStore()
    const [scanning, setScanning] = useState(false)
    const [scanFound, setScanFound] = useState(false)
    const [name, setName] = useState('')
    const [dose, setDose] = useState('')
    const [freq, setFreq] = useState('1')
    const [time, setTime] = useState('08:00')
    const [sup, setSup] = useState('')
    const [inst, setInst] = useState('')
    const [warn, setWarn] = useState('')

    const handleScan = () => {
        if (scanning) { setScanning(false); return }
        setScanning(true); setScanFound(false)
        setTimeout(() => {
            setScanning(false); setScanFound(true)
            setName('Atorvastatin'); setDose('20mg'); setInst('Take once daily at bedtime')
            setWarn('Avoid grapefruit'); setSup('30')
            toast('Barcode scanned', 'ts')
        }, 2500)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const f = parseInt(freq)
        const tM_val = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
        const mT_val = (n: number) => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
        const times = [time]
        if (f >= 2) times.push(mT_val((tM_val(time) + 360) % 1440))
        if (f >= 3) times.push(mT_val((tM_val(time) + 720) % 1440))
        addMed({ name, dose, freq: f, times, inst, warn, fw: 0, sup: parseInt(sup) || 30, tot: parseInt(sup) || 30, dpd: f })
        onClose()
    }

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'var(--color-overlay)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, maxHeight: '88vh', background: 'var(--color-bg-primary)', borderRadius: '16px 16px 0 0', overflowY: 'auto' }}>
                <div style={{ width: 36, height: 4, background: 'var(--color-text-tertiary)', opacity: 0.3, margin: '10px auto', borderRadius: 4 }} />
                <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-primary)' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>Add Medication</h3>
                    <button onClick={onClose} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', borderRadius: '50%' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>
                <div style={{ padding: 20 }}>
                    <button onClick={handleScan} style={{
                        width: '100%', padding: 12, background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-primary)',
                        borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7V5a2 2 0 012-2h2" /><path d="M17 3h2a2 2 0 012 2v2" /><path d="M21 17v2a2 2 0 01-2 2h-2" /><path d="M7 21H5a2 2 0 01-2-2v-2" /></svg>
                        Scan Prescription Barcode
                    </button>

                    {scanning && (
                        <div style={{ background: 'var(--color-text-primary)', borderRadius: 10, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
                            <div className="animate-laser" style={{ position: 'absolute', left: '10%', right: '10%', height: 2, background: 'var(--color-red)', boxShadow: '0 0 8px var(--color-red)' }} />
                        </div>
                    )}

                    {scanFound && (
                        <div className="animate-fade-in" style={{ padding: 12, background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)', borderRadius: 10, fontSize: 13, marginBottom: 14, fontWeight: 500 }}>
                            <strong>Scanned:</strong> Atorvastatin 20mg — Take once daily at bedtime
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <FormField label="Name"><input className="fi" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Levothyroxine" /></FormField>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <FormField label="Dosage"><input className="fi" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 50mg" /></FormField>
                            <FormField label="Frequency">
                                <select className="fi" value={freq} onChange={e => setFreq(e.target.value)} style={{ appearance: 'auto' }}>
                                    <option value="1">Once daily</option><option value="2">Twice daily</option><option value="3">Three times</option>
                                </select>
                            </FormField>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <FormField label="Time"><input className="fi" type="time" value={time} onChange={e => setTime(e.target.value)} /></FormField>
                            <FormField label="Pills in Bottle"><input className="fi" type="number" value={sup} onChange={e => setSup(e.target.value)} placeholder="30" min="0" /></FormField>
                        </div>
                        <FormField label="Instructions"><input className="fi" value={inst} onChange={e => setInst(e.target.value)} placeholder="e.g. Take on empty stomach" /></FormField>
                        <FormField label="Warnings"><input className="fi" value={warn} onChange={e => setWarn(e.target.value)} placeholder="e.g. Avoid grapefruit" /></FormField>
                        <button type="submit" style={{ width: '100%', padding: 14, background: 'var(--color-accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 12, marginTop: 6 }}>
                            Add Medication
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 14, flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
            {children}
        </div>
    )
}
