// Common types for state management

export interface AuthSession {
  address: string;
  signedMessage: string;
  signerAddress: string;
  authenticatedAt: number;
  expiresAt: number;
  refreshToken?: string;
}

export interface RegisteredUser {
  createdAt: number;
  email?: string;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'signing';

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormState {
  status: FormStatus;
  error?: string;
  data?: any;
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
  data?: any;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}