'use client'

import { useState, useMemo, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createTicket } from '@/lib/workflow-api'
import { pairsToRecord } from '@/components/workflow/KeyValueEditor'
import type { DocumentRow } from '@/lib/types'
import { fieldLabel } from '@/lib/utils'

interface KVPair { key: string; value: string }

interface CreateTicketModalProps {
  entityName: string
  entityId: string
  row: DocumentRow
  onClose: () => void
}

const AUDIT_FIELDS = new Set([
  'active', 'createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate',
  'version', '_id', 'id',
])
const AUDIT_DISPLAY_FIELDS = ['createdBy', 'createdDate', 'lastModifiedBy', 'lastModifiedDate']

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Returns true if the string input represents a value different from the original. */
function isPairChanged(newValStr: string, originalVal: unknown): boolean {
  let parsed: unknown
  try { parsed = JSON.parse(newValStr) } catch { parsed = newValStr }
  return JSON.stringify(parsed) !== JSON.stringify(originalVal)
}

export default function CreateTicketModal({ entityName, entityId, row, onClose }: CreateTicketModalProps) {
  const router = useRouter()
  const [pairs, setPairs] = useState<KVPair[]>([{ key: '', value: '' }])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const editableFields = Object.entries(row).filter(([key]) => !AUDIT_FIELDS.has(key))
  const auditFields = AUDIT_DISPLAY_FIELDS
    .filter((k) => k in row)
    .map((k) => ({ key: k, value: row[k] }))

  const changedPairs = useMemo(
    () => pairs.filter((p) => p.key.trim() && isPairChanged(p.value, row[p.key])),
    [pairs, row],
  )
  const hasChanges = changedPairs.length > 0

  // ── Helpers ──────────────────────────────────────────────────────────────

  function addFieldFromRow(key: string, value: unknown) {
    const strVal =
      value === null || value === undefined
        ? ''
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value)

    const existingIdx = pairs.findIndex((p) => p.key === key)
    if (existingIdx !== -1) {
      setPairs(pairs.map((p, i) => (i === existingIdx ? { key, value: strVal } : p)))
      return
    }
    const emptyIdx = pairs.findIndex((p) => !p.key.trim())
    if (emptyIdx !== -1) {
      setPairs(pairs.map((p, i) => (i === emptyIdx ? { key, value: strVal } : p)))
    } else {
      setPairs([...pairs, { key, value: strVal }])
    }
  }

  function updatePair(idx: number, field: 'key' | 'value', val: string) {
    setPairs(pairs.map((p, i) => (i === idx ? { ...p, [field]: val } : p)))
  }

  function removePair(idx: number) {
    const next = pairs.filter((_, i) => i !== idx)
    setPairs(next.length === 0 ? [{ key: '', value: '' }] : next)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const newData = pairsToRecord(pairs)
    if (Object.keys(newData).length === 0) {
      setError('Add at least one field to change.')
      return
    }
    if (!hasChanges) {
      setError(
        'No changes detected — the new values are identical to the current document. Update at least one field before submitting.',
      )
      return
    }

    setSubmitting(true)
    try {
      const ticket = await createTicket({ entityName, entityId, newData })
      router.push(`/workflow/${ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      setSubmitting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">

        {/* ── Gradient header ─────────────────────────────────────────────── */}
        <div className="shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Create Change Request</h2>
                <p className="mt-0.5 text-xs text-indigo-200 font-mono">
                  <span className="font-sans font-semibold text-white/90">{entityName}</span>
                  <span className="mx-1.5 text-indigo-300">·</span>
                  {entityId.length > 18 ? `${entityId.slice(0, 16)}…` : entityId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasChanges && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {changedPairs.length} change{changedPairs.length !== 1 ? 's' : ''}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Scrollable form body ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Current values picker */}
            {editableFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Current Values
                  </p>
                  <span className="text-xs text-gray-400">— click a row to add it to the editor</span>
                </div>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  {editableFields.map(([key, value]) => {
                    const display = displayValue(value)
                    const isInEditor = pairs.some((p) => p.key === key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => addFieldFromRow(key, value)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-indigo-50/70 transition-colors group"
                      >
                        <span
                          className={`text-xs font-mono font-semibold w-36 shrink-0 transition-colors ${
                            isInEditor ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'
                          }`}
                        >
                          {fieldLabel(key)}
                        </span>
                        <span className="text-xs text-gray-500 truncate flex-1 group-hover:text-gray-700">
                          {display.length > 72 ? `${display.slice(0, 70)}…` : display}
                        </span>
                        {isInEditor ? (
                          <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-xs font-medium text-indigo-500">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            added
                          </span>
                        ) : (
                          <span className="ml-auto shrink-0 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            + add
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Fields-to-change editor with live diff */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Fields to Change
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Click a field above to pre-populate, or type manually. Values are parsed as JSON where possible.
              </p>

              <div className="space-y-2">
                {pairs.map((pair, idx) => {
                  const originalVal = pair.key ? row[pair.key] : undefined
                  const keyExistsInRow = pair.key.trim() !== '' && pair.key in row
                  const changed = keyExistsInRow && isPairChanged(pair.value, originalVal)
                  const unchanged = keyExistsInRow && pair.value !== '' && !changed

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border transition-all ${
                        changed
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : unchanged
                            ? 'border-amber-300 bg-amber-50/40'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 p-2">
                        {/* Change-state stripe */}
                        <div
                          className={`h-8 w-1 rounded-full shrink-0 ${
                            changed ? 'bg-emerald-500' : unchanged ? 'bg-amber-400' : 'bg-gray-200'
                          }`}
                        />

                        <input
                          type="text"
                          placeholder="field name"
                          value={pair.key}
                          onChange={(e) => updatePair(idx, 'key', e.target.value)}
                          className="w-2/5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                        />

                        <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>

                        <input
                          type="text"
                          placeholder="new value"
                          value={pair.value}
                          onChange={(e) => updatePair(idx, 'value', e.target.value)}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                        />

                        <button
                          type="button"
                          onClick={() => removePair(idx)}
                          aria-label="Remove field"
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Old → new diff hint shown when key exists in the document */}
                      {keyExistsInRow && (
                        <div className="flex items-center gap-2 px-4 pb-2.5">
                          <span className="text-xs text-gray-400 shrink-0">Was:</span>
                          <span
                            className={`text-xs font-mono truncate max-w-[220px] ${
                              changed ? 'text-gray-400 line-through' : 'text-gray-500'
                            }`}
                          >
                            {displayValue(originalVal)}
                          </span>
                          {changed && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              changed
                            </span>
                          )}
                          {unchanged && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 shrink-0">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              same as current
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setPairs([...pairs, { key: '', value: '' }])}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add field
              </button>
            </div>

            {/* Audit info */}
            {auditFields.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Audit Info
                </p>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/60">
                  {auditFields.map(({ key, value }) => (
                    <div key={key} className="flex items-center gap-3 px-4 py-2">
                      <span className="text-xs font-mono font-medium text-gray-400 w-36 shrink-0">
                        {fieldLabel(key)}
                      </span>
                      <span className="text-xs text-gray-400 truncate">{displayValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <svg className="h-4 w-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* ── Sticky footer ────────────────────────────────────────────────── */}
          <div className="shrink-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4 backdrop-blur-sm">
            <div className="text-xs">
              {hasChanges ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {changedPairs.length} field{changedPairs.length !== 1 ? 's' : ''} will be changed
                </span>
              ) : (
                <span className="text-gray-400">No changes detected yet</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !hasChanges}
                title={!hasChanges ? 'Make at least one actual change before submitting' : undefined}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit for Review
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
