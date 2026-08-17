// Common types for state management

// AuthSession is defined once as a Zod-derived type in @/types/api and re-exported
// here so existing `@/store/types` importers keep pointing at the single source of truth.
export type { AuthSession } from "@/types/api";

export interface RegisteredUser {
  createdAt: number;
  email?: string;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'signing';

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormState {
  status: FormStatus;
  error?: string;
  data?: unknown;
}

export interface FilterState {
  searchQuery: string;
  statusFilter: string;
  activeTab: string;
  currentPage: number;
  itemsPerPage: number;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: unknown;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}