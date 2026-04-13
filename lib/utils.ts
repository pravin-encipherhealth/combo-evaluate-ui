// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/**
 * Converts a kebab-case collection alias to a human-readable name.
 * "three-combo"  →  "Three Combo"
 * "proxy-hcc-codes" → "Proxy HCC Codes"
 */
export function formatAlias(alias: string): string {
  return alias
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Converts a camelCase field name to a Title Case label.
 * "diagnosis1Code"  → "Diagnosis 1 Code"
 * "createdDate"     → "Created Date"
 * "inputSource"     → "Input Source"
 */
export function fieldLabel(key: string): string {
  return key
    // Insert space before uppercase letters
    .replace(/([A-Z])/g, ' $1')
    // Insert space before digits preceded by a letter
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

/** ISO 8601 date/datetime regex. */
const ISO_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/

export function isIsoDate(value: string): boolean {
  return ISO_RE.test(value)
}

/** Format an ISO date string for display. */
export function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value))
  } catch {
    return value
  }
}

// ---------------------------------------------------------------------------
// Column ordering for the data table
// ---------------------------------------------------------------------------

const AUDIT_FIELDS = new Set([
  'active',
  'createdBy',
  'lastModifiedBy',
  'createdDate',
  'lastModifiedDate',
])

const HIDDEN_FIELDS = new Set(['version'])

const IDENTITY_FIELDS = ['id', '_id']

/**
 * Orders the columns from a document row in a stable, readable sequence:
 * 1. Identity field (id / _id)
 * 2. Entity-specific fields (alphabetical)
 * 3. Audit fields in a fixed order
 */
export function orderColumns(keys: string[]): string[] {
  const identity = keys.filter((k) => IDENTITY_FIELDS.includes(k))
  const audit = AUDIT_FIELDS
  const hidden = HIDDEN_FIELDS

  const entity = keys
    .filter((k) => !IDENTITY_FIELDS.includes(k) && !audit.has(k) && !hidden.has(k))
    .sort()

  const auditOrdered = [
    'active',
    'createdBy',
    'lastModifiedBy',
    'createdDate',
    'lastModifiedDate',
  ].filter((k) => keys.includes(k))

  return [...identity, ...entity, ...auditOrdered]
}

/** Derive all unique column keys from a list of document rows. */
export function deriveColumns(rows: Record<string, unknown>[]): string[] {
  const keySet = new Set<string>()
  rows.forEach((row) => Object.keys(row).forEach((k) => keySet.add(k)))
  // Remove hidden fields
  HIDDEN_FIELDS.forEach((k) => keySet.delete(k))
  return orderColumns(Array.from(keySet))
}
