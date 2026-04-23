'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTicket } from '@/lib/workflow-api'
import KeyValueEditor, { pairsToRecord } from '@/components/workflow/KeyValueEditor'

const ENTITY_NAMES = [
  'Combocode', 'Bilateral', 'ThreeCombo', 'FourCombo',
  'MultipleSite', 'Overlapping', 'SpecifiedAndUnspecified',
  'ProxyHccCodes', 'ChronicCondition', 'RuleEngineCodes', 'ComboMostSpecific',
]

export default function CreateTicketPage() {
  const router = useRouter()
  const [entityName, setEntityName] = useState('')
  const [entityId, setEntityId] = useState('')
  const [pairs, setPairs] = useState([{ key: '', value: '' }])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/workflow" className="hover:text-gray-800 transition-colors">Workflow</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-800">New Ticket</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Change Request</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
          {/* Entity Name */}
          <div className="px-6 py-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Collection (Entity)
            </label>
            <select
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select a collection…</option>
              {ENTITY_NAMES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Entity ID */}
          <div className="px-6 py-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Document ID
            </label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              required
              placeholder="MongoDB _id of the document to change"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-mono shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Find this on the collection data page.
            </p>
          </div>

          {/* New data */}
          <div className="px-6 py-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fields to Change
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Only include fields you want to update. Values are parsed as JSON when possible.
            </p>
            <KeyValueEditor value={pairs} onChange={setPairs} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/workflow"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
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
  )
}
