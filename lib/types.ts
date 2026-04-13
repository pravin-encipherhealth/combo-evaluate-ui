// ---------------------------------------------------------------------------
// Backend API response shapes
// ---------------------------------------------------------------------------

export type ApiStatus = 'SUCCESS' | 'FAILED' | 'EXCEPTION' | 'USER_DEFINED_ERROR'

export interface ApiResponse<T> {
  status: ApiStatus
  message: string
  response: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// A single collection descriptor returned by GET /api/v1/data/collections
export interface CollectionInfo {
  alias: string
  mongoCollection: string
}

// Count response from GET /api/v1/data/{collection}/count
export interface CountResponse {
  collection: string
  count: number
  activeOnly: boolean
}

// Generic document row — keys are field names, values are anything the backend sends
export type DocumentRow = Record<string, unknown>

// ---------------------------------------------------------------------------
// Query parameters for the collection data endpoint
// ---------------------------------------------------------------------------

export type SortDir = 'ASC' | 'DESC'

export interface CollectionQueryParams {
  page: number
  size: number
  sortBy: string
  sortDir: SortDir
  activeOnly: boolean
}

export const DEFAULT_QUERY: CollectionQueryParams = {
  page: 0,
  size: 20,
  sortBy: 'createdDate',
  sortDir: 'DESC',
  activeOnly: true,
}

// ---------------------------------------------------------------------------
// Collection metadata used in the UI
// ---------------------------------------------------------------------------

export interface CollectionMeta extends CollectionInfo {
  displayName: string
  count: number | null  // null while loading or on error
}
