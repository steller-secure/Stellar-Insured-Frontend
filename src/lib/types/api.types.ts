/**
 * Shared API response types used across all service modules.
 */

/** Standard paginated list envelope returned by the backend. */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Standard single-resource envelope. */
export interface SingleResponse<T> {
  data: T;
  message?: string;
}

/** Pagination query parameters. */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** Sort query parameters. */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
