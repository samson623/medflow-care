export interface MedLookupResult {
    name: string
    dosage: string
    instructions: string
    warnings: string
}

function upcToNdc(barcode: string): string | null {
    const digits = barcode.replace(/\D/g, '')
    if (digits.length < 11) return null

    // UPC-A = 12 digits. Strip leading 0 and check digit → 10 digit NDC
    const ndc10 = digits.length === 12 ? digits.slice(1, 11) : digits.slice(0, 10)

    // Try common NDC formats: 4-4-2, 5-3-2, 5-4-1
    const patterns = [
        `${ndc10.slice(0, 4)}-${ndc10.slice(4, 8)}-${ndc10.slice(8, 10)}`,
        `${ndc10.slice(0, 5)}-${ndc10.slice(5, 8)}-${ndc10.slice(8, 10)}`,
        `${ndc10.slice(0, 5)}-${ndc10.slice(5, 9)}-${ndc10.slice(9, 10)}`,
    ]

    return patterns.join(',')
}

function cleanText(text: string | undefined): string {
    if (!text) return ''
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 300)
}

export async function lookupByBarcode(barcode: string): Promise<MedLookupResult | null> {
    const ndcVariants = upcToNdc(barcode)
    if (!ndcVariants) return null

    // Try NDC directory first
    for (const ndc of ndcVariants.split(',')) {
        try {
            const ndcRes = await fetch(
                `https://api.fda.gov/drug/ndc.json?search=packaging.package_ndc:"${ndc}"&limit=1`
            )
            if (ndcRes.ok) {
                const ndcData = await ndcRes.json()
                const product = ndcData.results?.[0]
                if (product) {
                    const name = product.brand_name || product.generic_name || ''
                    const strength = product.active_ingredients
                        ?.map((i: { strength: string }) => i.strength)
                        .join(', ') || ''
                    const route = product.route?.[0] || ''
                    const dosageForm = product.dosage_form || ''
                    return {
                        name,
                        dosage: strength,
                        instructions: [dosageForm, route].filter(Boolean).join(' — '),
                        warnings: '',
                    }
                }
            }
        } catch {
            // try next pattern
        }
    }

    // Fallback: try drug label endpoint for warnings
    for (const ndc of ndcVariants.split(',')) {
        try {
            const labelRes = await fetch(
                `https://api.fda.gov/drug/label.json?search=openfda.package_ndc:"${ndc}"&limit=1`
            )
            if (labelRes.ok) {
                const labelData = await labelRes.json()
                const label = labelData.results?.[0]
                if (label) {
                    const name = label.openfda?.brand_name?.[0] || label.openfda?.generic_name?.[0] || ''
                    const dosage = label.dosage_and_administration?.[0] || ''
                    const warnings = label.warnings?.[0] || label.warnings_and_cautions?.[0] || ''
                    const instructions = label.indications_and_usage?.[0] || ''
                    return {
                        name: cleanText(name),
                        dosage: cleanText(dosage),
                        instructions: cleanText(instructions),
                        warnings: cleanText(warnings),
                    }
                }
            }
        } catch {
            // try next pattern
        }
    }

    return null
}
