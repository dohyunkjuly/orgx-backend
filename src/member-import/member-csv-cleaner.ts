/**
 * Implements the OX-65 acceptance criteria and the rules from the
 * "OX-64 Data Quality Rules" Confluence doc:
 *
 *  - Detect duplicates by email (exact match) and by name + phone.
 *  - Keep the most recently updated record, discard older duplicates.
 *  - Flag rows missing mandatory fields (fullName, email).
 *  - Default placeholder for non-mandatory missing fields (phone, etc).
 *  - Lowercase + validate emails.
 *  - Normalize phone numbers (strip spaces/dashes/parens, keep digits, E.164-ish).
 *  - Trim + consistently capitalize names.
 *  - Rows failing validation are reported with a reason (caller writes the rejected.csv).
 */

export interface RawMemberRow {
  [key: string]: string | undefined
}

export interface CleanedMember {
  email: string
  fullName: string
  phone: string | null
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  qualification: string
  university: string
  department: string
  designation: string
  /** Used only to resolve duplicates — not persisted unless the column existed in the source. */
  updatedAt: Date
}

export interface RejectedRow {
  row: number
  data: Record<string, string>
  reason: string
}

export interface CleaningResult {
  totalRows: number
  valid: CleanedMember[]
  duplicatesRemoved: number
  rejected: RejectedRow[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MANDATORY_FIELDS = ['fullName', 'email'] as const

const FIELD_ALIASES: Record<string, string[]> = {
  fullName: ['fullname', 'full name', 'name'],
  email: ['email', 'email address'],
  phone: ['phone', 'phone number', 'mobile', 'secondary phone'],
  gender: ['gender'],
  qualification: ['qualification'],
  university: ['university'],
  department: ['department'],
  designation: ['designation'],
  updatedAt: ['updated at', 'updatedat', 'last updated', 'modified at'],
}

function normalizeHeaderKey(key: string): string {
  return key.trim().toLowerCase()
}

/** Maps arbitrary CSV headers (e.g. "Full Name", "Phone Number") onto our known field names. */
function buildHeaderMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const header of headers) {
    const normalized = normalizeHeaderKey(header)
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalized)) {
        map[header] = field
        break
      }
    }
  }
  return map
}

function capitalizeName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((part) => (part.length ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(' ')
}

/** Strips spaces, dashes, and parentheses; keeps a leading + if present. */
function normalizePhone(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return null
  return hasPlus ? `+${digits}` : digits
}

function normalizeGender(value: string | undefined): 'MALE' | 'FEMALE' | 'OTHER' {
  const normalized = (value ?? '').trim().toUpperCase()
  if (normalized === 'MALE' || normalized === 'M') return 'MALE'
  if (normalized === 'FEMALE' || normalized === 'F') return 'FEMALE'
  return 'OTHER'
}

function placeholderOrTrim(value: string | undefined): string {
  const trimmed = (value ?? '').trim()
  return trimmed.length ? trimmed : 'Not Provided'
}

export class MemberCsvCleaner {
  clean(rows: RawMemberRow[], headers: string[]): CleaningResult {
    const headerMap = buildHeaderMap(headers)
    const rejected: RejectedRow[] = []
    const candidates: CleanedMember[] = []

    rows.forEach((rawRow, index) => {
      const rowNumber = index + 1
      const raw: Record<string, string> = {}
      const byField: Record<string, string> = {}

      for (const [originalKey, value] of Object.entries(rawRow)) {
        const text = (value ?? '').toString()
        raw[originalKey] = text
        const field = headerMap[originalKey]
        if (field) byField[field] = text
      }

      const missing = MANDATORY_FIELDS.filter((field) => !byField[field]?.trim())
      if (missing.length) {
        rejected.push({ row: rowNumber, data: raw, reason: `Missing mandatory field(s): ${missing.join(', ')}` })
        return
      }

      const email = byField.email.trim().toLowerCase().replace(/\s+/g, '')
      if (!EMAIL_RE.test(email)) {
        rejected.push({ row: rowNumber, data: raw, reason: 'Invalid email format' })
        return
      }

      const fullName = capitalizeName(byField.fullName)
      if (!fullName) {
        rejected.push({ row: rowNumber, data: raw, reason: 'Full name is empty after trimming' })
        return
      }

      const phone = byField.phone ? normalizePhone(byField.phone) : null
      const updatedRaw = byField.updatedAt
      const updatedAt = updatedRaw && !Number.isNaN(Date.parse(updatedRaw)) ? new Date(updatedRaw) : new Date(0)

      candidates.push({
        email,
        fullName,
        phone,
        gender: normalizeGender(byField.gender),
        qualification: placeholderOrTrim(byField.qualification),
        university: placeholderOrTrim(byField.university),
        department: placeholderOrTrim(byField.department),
        designation: placeholderOrTrim(byField.designation),
        updatedAt,
      })
    })

    const { kept, duplicatesRemoved } = this.dedupe(candidates)

    return {
      totalRows: rows.length,
      valid: kept,
      duplicatesRemoved,
      rejected,
    }
  }

  /**
   * Detects duplicates by exact email match and by (name + phone) match.
   * Keeps the most recently updated record (highest updatedAt) for each group.
   */
  private dedupe(candidates: CleanedMember[]): { kept: CleanedMember[]; duplicatesRemoved: number } {
    const byKey = new Map<string, CleanedMember>()
    let duplicatesRemoved = 0

    const keysFor = (m: CleanedMember): string[] => {
      const keys = [`email:${m.email}`]
      if (m.phone) keys.push(`name+phone:${m.fullName.toLowerCase()}|${m.phone}`)
      return keys
    }

    // Union-find-lite: merge any candidate sharing a key with an already-kept one.
    for (const candidate of candidates) {
      const matchKeys = keysFor(candidate)
      let existingKey: string | undefined
      let existing: CleanedMember | undefined

      for (const key of matchKeys) {
        if (byKey.has(key)) {
          existingKey = key
          existing = byKey.get(key)
          break
        }
      }

      if (!existing) {
        for (const key of matchKeys) byKey.set(key, candidate)
        continue
      }

      duplicatesRemoved += 1
      const winner = candidate.updatedAt >= existing.updatedAt ? candidate : existing
      for (const key of [...keysFor(existing), ...matchKeys]) byKey.set(key, winner)
      void existingKey
    }

    const kept = Array.from(new Set(byKey.values()))
    return { kept, duplicatesRemoved }
  }
}
