import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

interface BarcodeScannerProps {
    onScan: (code: string) => void
    onClose: () => void
}

const SUPPORTED_FORMATS = [
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE,
]

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [isStarting, setIsStarting] = useState(true)
    const hasScannedRef = useRef(false)

    const stopScanner = useCallback(async () => {
        try {
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.stop()
            }
        } catch {
            // scanner already stopped
        }
        try {
            scannerRef.current?.clear()
        } catch {
            // container already cleared
        }
    }, [])

    useEffect(() => {
        const readerId = 'barcode-scanner-reader'
        let mounted = true

        const startScanner = async () => {
            try {
                const scanner = new Html5Qrcode(readerId, {
                    formatsToSupport: SUPPORTED_FORMATS,
                    verbose: false,
                })
                scannerRef.current = scanner

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 280, height: 160 },
                        aspectRatio: 1.0,
                        disableFlip: false,
                    },
                    (decodedText) => {
                        if (!hasScannedRef.current && mounted) {
                            hasScannedRef.current = true
                            onScan(decodedText)
                        }
                    },
                    () => {
                        // scan failure (frame without a code) — ignore
                    }
                )

                if (mounted) setIsStarting(false)
            } catch (err) {
                if (!mounted) return
                const msg = err instanceof Error ? err.message : String(err)
                if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
                    setError('Camera access denied. Please allow camera permissions and try again.')
                } else if (msg.includes('NotFoundError') || msg.includes('no camera')) {
                    setError('No camera found on this device.')
                } else {
                    setError(`Camera error: ${msg}`)
                }
                setIsStarting(false)
            }
        }

        startScanner()

        return () => {
            mounted = false
            stopScanner()
        }
    }, [onScan, stopScanner])

    const handleClose = async () => {
        await stopScanner()
        onClose()
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 600,
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Header */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 10,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                }}
            >
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
                    Scan Medication Barcode
                </span>
                <button
                    onClick={handleClose}
                    aria-label="Close scanner"
                    style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        color: '#fff',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Scanner viewport */}
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                <div
                    id="barcode-scanner-reader"
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        borderRadius: 12,
                        overflow: 'hidden',
                    }}
                />

                {/* Loading state */}
                {isStarting && !error && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            color: '#fff',
                        }}
                    >
                        <div className="scanner-loading-spinner" />
                        <span style={{ fontSize: 14, opacity: 0.8 }}>Starting camera...</span>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            padding: 32,
                            color: '#fff',
                            textAlign: 'center',
                        }}
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6B7A" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85 }}>{error}</p>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '12px 32px',
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 10,
                                color: '#fff',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>

            {/* Footer hint */}
            {!error && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '24px 20px',
                        textAlign: 'center',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                        Point your camera at the barcode on your medication bottle
                    </p>
                </div>
            )}
        </div>
    )
}
