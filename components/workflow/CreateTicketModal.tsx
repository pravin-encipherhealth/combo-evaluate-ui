'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createTicket } from '@/lib/workflow-api'
import KeyValueEditor, { pairsToRecord } from '@/components/workflow/KeyValueEditor'
import type { DocumentRow } from '@/lib/types'
import { fieldLabel } from '@/lib/utils'

interface CreateTicketModalProps {
  entityName: string
  entityId: string
  row: DocumentRow
  onClose: () => void
}

const AUDIT_FIELDS = new Set(['active', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate', '_id', 'id'])
const AUDIT_DISPLAY_FIELDS = ['createdBy', 'createdDate', 'updatedBy', 'updatedDate']

export default function CreateTicketModal({ entityName, entityId, row, onClose }: CreateTicketModalProps) {
  const router = useRouter()
  const [pairs, setPairs] = useState([{ key: '', value: '' }])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fields the user can click to add to the editor (exclude audit/id fields)
  const editableFields = Object.entries(row).filter(([key]) => !AUDIT_FIELDS.has(key))

  // Audit fields shown read-only for reference
  const auditFields = AUDIT_DISPLAY_FIELDS
    .filter((key) => key in row)
    .map((key) => ({ key, value: row[key] }))

  function addFieldFromRow(key: string, value: unknown) {
    const strValue = value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)

    // If key already exists, update it in place (prevents duplicate entries)
    const existingIdx = pairs.findIndex((p) => p.key === key)
    if (existingIdx !== -1) {
      const next = [...pairs]
      next[existingIdx] = { key, value: strValue }
      setPairs(next)
      return
    }

    // If there's an empty row, fill it; otherwise append
    const emptyIdx = pairs.findIndex((p) => !p.key.trim())
    if (emptyIdx !== -1) {
      const next = [...pairs]
      next[emptyIdx] = { key, value: strValue }
      setPairs(next)
    } else {
      setPairs([...pairs, { key, value: strValue }])
    }
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
      const ticket = await createTicket({ entityName, entityId, newData })
      router.push(`/workflow/${ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Change Request</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{entityName} · {entityId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            {/* Current fields - click to add */}
            {editableFields.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Current Values — click to add to editor
                </p>
                <div className="rounded-lg border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                  {editableFields.map(([key, value]) => {
                    const display = value === null || value === undefined
                      ? '—'
                      : typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => addFieldFromRow(key, value)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors group"
                      >
                        <span className="text-xs font-mono font-medium text-gray-600 w-40 shrink-0 group-hover:text-blue-700">
                          {fieldLabel(key)}
                        </span>
                        <span className="text-xs text-gray-500 truncate group-hover:text-gray-700">
                          {display.length > 80 ? `${display.slice(0, 78)}…` : display}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          + add
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Audit fields - read only */}
            {auditFields.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Audit Info
                </p>
                <div className="rounded-lg border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                  {auditFields.map(({ key, value }) => {
                    const display = value === null || value === undefined
                      ? '—'
                      : typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)
                    return (
                      <div key={key} className="flex items-center gap-3 px-4 py-2">
                        <span className="text-xs font-mono font-medium text-gray-400 w-40 shrink-0">
                          {fieldLabel(key)}
                        </span>
                        <span className="text-xs text-gray-400 truncate">{display}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Fields to change */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Fields to Change
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Click a field above to pre-populate, or type manually. Values are parsed as JSON where possible.
              </p>
              <KeyValueEditor value={pairs} onChange={setPairs} />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
