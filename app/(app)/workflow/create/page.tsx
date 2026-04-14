'use client'

import { useState, useMemo, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTicket } from '@/lib/workflow-api'
import { pairsToRecord } from '@/components/workflow/KeyValueEditor'

interface KVPair { key: string; value: string }

const ENTITY_NAMES = [
  'Combocode', 'Bilateral', 'ThreeCombo', 'FourCombo',
  'MultipleSite', 'Overlapping', 'SpecifiedAndUnspecified',
  'ProxyHccCodes', 'ChronicCondition', 'RuleEngineCodes', 'ComboMostSpecific',
]

export default function CreateTicketPage() {
  const router = useRouter()
  const [entityName, setEntityName] = useState('')
  const [entityId, setEntityId] = useState('')
  const [pairs, setPairs] = useState<KVPair[]>([{ key: '', value: '' }])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fieldCount = useMemo(
    () => pairs.filter((p) => p.key.trim() && p.value.trim()).length,
    [pairs],
  )

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

    setSubmitting(true)
    try {
      const ticket = await createTicket({ entityName, entityId: entityId.trim(), newData })
      router.push(`/workflow/${ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const isReady = entityName && entityId.trim() && fieldCount > 0

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto max-w-2xl px-4 py-10">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/workflow" className="hover:text-gray-800 transition-colors">
            Workflow
          </Link>
          <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-800">New Ticket</span>
        </nav>

        {/* Hero header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Create Change Request</h1>
            <p className="mt-1 text-sm text-gray-500">
              Propose field-level changes to a document. Your request will be reviewed before being applied.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Step 1 — Target */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
                1
              </span>
              <h2 className="text-sm font-semibold text-gray-800">Identify the Target Document</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Collection */}
              <div className="px-6 py-5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Collection
                </label>
                <div className="relative">
                  <select
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    required
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-800"
                  >
                    <option value="">Select a collection…</option>
                    {ENTITY_NAMES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {entityName && (
                  <p className="mt-2 text-xs text-indigo-600 font-medium">
                    ✓ {entityName} selected
                  </p>
                )}
              </div>

              {/* Document ID */}
              <div className="px-6 py-5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Document ID
                </label>
                <input
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  required
                  placeholder="e.g. 507f1f77bcf86cd799439011"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono shadow-sm placeholder:text-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  The MongoDB <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-600">_id</code> of the document — find it on the collection data page.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 — Changes */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
                  2
                </span>
                <h2 className="text-sm font-semibold text-gray-800">Specify the Changes</h2>
              </div>
              {fieldCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="px-6 py-5">
              <p className="text-xs text-gray-400 mb-4">
                Only include fields you want to update. Values are parsed as JSON where possible (e.g. <code className="rounded bg-gray-100 px-1 font-mono text-gray-600">true</code>, <code className="rounded bg-gray-100 px-1 font-mono text-gray-600">42</code>, <code className="rounded bg-gray-100 px-1 font-mono text-gray-600">["a","b"]</code>).
              </p>

              <div className="space-y-2">
                {pairs.map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`h-8 w-1 rounded-full shrink-0 ${pair.key.trim() && pair.value.trim() ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                    <input
                      type="text"
                      placeholder="field name"
                      value={pair.key}
                      onChange={(e) => updatePair(idx, 'key', e.target.value)}
                      className="w-2/5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    />
                    <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <input
                      type="text"
                      placeholder="new value"
                      value={pair.value}
                      onChange={(e) => updatePair(idx, 'value', e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
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
                ))}
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
          </div>

          {/* Step 3 — Review & submit */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
                3
              </span>
              <h2 className="text-sm font-semibold text-gray-800">Review &amp; Submit</h2>
            </div>

            <div className="px-6 py-5">
              {/* Summary checklist */}
              <div className="space-y-2 mb-5">
                <ChecklistItem done={!!entityName} label={entityName ? `Collection: ${entityName}` : 'Select a collection'} />
                <ChecklistItem done={!!entityId.trim()} label={entityId.trim() ? `Document ID: ${entityId.trim().slice(0, 16)}${entityId.length > 16 ? '…' : ''}` : 'Enter the document ID'} />
                <ChecklistItem done={fieldCount > 0} label={fieldCount > 0 ? `${fieldCount} field${fieldCount !== 1 ? 's' : ''} ready to change` : 'Add at least one field to change'} />
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 mb-5">
                <svg className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                  Your request will be sent for supervisor review before any data is modified. You can track its status on the Workflow page.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-5">
                  <svg className="h-4 w-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end">
                <Link
                  href="/workflow"
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || !isReady}
                  title={!isReady ? 'Fill in all fields above before submitting' : undefined}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          </div>

        </form>
      </div>
    </div>
  )
}

// ── Small helper component ────────────────────────────────────────────────────

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 transition-all ${
          done ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'
        }`}
      >
        {done && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}
