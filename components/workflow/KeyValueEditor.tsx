'use client'

import { useState } from 'react'

interface KVPair { key: string; value: string }

interface KeyValueEditorProps {
  value: KVPair[]
  onChange: (pairs: KVPair[]) => void
}

export default function KeyValueEditor({ value, onChange }: KeyValueEditorProps) {
  function update(idx: number, field: 'key' | 'value', val: string) {
    const next = value.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    onChange(next)
  }

  function addRow() {
    onChange([...value, { key: '', value: '' }])
  }

  function removeRow(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      {value.map((pair, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="field name"
            value={pair.key}
            onChange={(e) => update(idx, 'key', e.target.value)}
            className="w-2/5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">:</span>
          <input
            type="text"
            placeholder="value"
            value={pair.value}
            onChange={(e) => update(idx, 'value', e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => removeRow(idx)}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
            aria-label="Remove field"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add field
      </button>
    </div>
  )
}

/** Converts KVPair[] to Record<string,unknown>, parsing JSON values where possible */
export function pairsToRecord(pairs: KVPair[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const { key, value } of pairs) {
    if (!key.trim()) continue
    try { result[key.trim()] = JSON.parse(value) }
    catch { result[key.trim()] = value }
  }
  return result
}
