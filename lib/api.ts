import type {
  ApiResponse,
  CollectionInfo,
  CollectionQueryParams,
  CountResponse,
  DocumentRow,
  PageResponse,
} from './types'

// ---------------------------------------------------------------------------
// Base URL resolution
//
// Server components (Node.js):  calls BACKEND_URL directly — no network hop
// Client components (browser):  uses '' so the fetch goes to the Next.js
//                                rewrite proxy → /api/v1/* → BACKEND_URL
// ---------------------------------------------------------------------------

function baseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL ?? 'http://localhost:8080'
  }
  return ''
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper with error handling
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    // Disable Next.js cache for data endpoints so every navigation is fresh
    next: { revalidate: 0 },
    ...init,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API error ${res.status}: ${text}`)
  }

  const body: ApiResponse<T> = await res.json()

  if (body.status !== 'SUCCESS') {
    throw new Error(body.message ?? 'Backend returned a non-success status')
  }

  return body.response
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/** Returns the list of all supported collection aliases. */
export async function fetchCollections(): Promise<CollectionInfo[]> {
  return apiFetch<CollectionInfo[]>('/api/v1/data/collections')
}

/** Returns the document count for a single collection. */
export async function fetchCollectionCount(
  alias: string,
  activeOnly = true,
): Promise<CountResponse> {
  return apiFetch<CountResponse>(
    `/api/v1/data/${encodeURIComponent(alias)}/count?activeOnly=${activeOnly}`,
  )
}

/** Fetches all collection counts in parallel. Returns a map of alias → count. */
export async function fetchAllCounts(
  aliases: string[],
  activeOnly = true,
): Promise<Record<string, number>> {
  const results = await Promise.allSettled(
    aliases.map((alias) => fetchCollectionCount(alias, activeOnly)),
  )

  return Object.fromEntries(
    aliases.map((alias, i) => {
      const r = results[i]
      return [alias, r.status === 'fulfilled' ? r.value.count : 0]
    }),
  )
}

/** Fetches one page of documents from a collection. */
export async function fetchCollectionData(
  alias: string,
  params: CollectionQueryParams,
): Promise<PageResponse<DocumentRow>> {
  const qs = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    activeOnly: String(params.activeOnly),
  })
  return apiFetch<PageResponse<DocumentRow>>(
    `/api/v1/data/${encodeURIComponent(alias)}?${qs.toString()}`,
  )
}
