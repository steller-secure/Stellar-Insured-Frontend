/**
 * Application-wide constants – centralizes shared configuration values
 * to improve consistency, readability, and maintainability across the app.
 *
 * Benefits:
 * - Eliminates hardcoded "magic numbers"
 * - Makes updates easier and less error-prone
 * - Provides a single source of truth for common settings
 */

// ─── Polling & Timeouts (ms) ─────────────────────────────────────────────────

/**
 * Interval for checking wallet/network changes.
 * Keeps the UI synchronized with the user's current Stellar network.
 */
export const NETWORK_POLL_INTERVAL = 5_000;

/**
 * Refresh interval for wallet balances.
 * Helps ensure displayed balances remain reasonably up-to-date
 * without excessive API requests.
 */
export const BALANCE_POLL_INTERVAL = 30_000;

/**
 * Debounce delay for search and filter inputs.
 * Prevents excessive filtering operations while users are typing.
 */
export const FILTER_DEBOUNCE_DELAY = 300;

/**
 * Duration to display copy-to-clipboard success feedback.
 */
export const COPY_FEEDBACK_TIMEOUT = 2_000;

/**
 * Delay before redirecting users after successful form submissions.
 * Gives users time to see confirmation messages.
 */
export const FORM_SUBMIT_TIMEOUT = 3_000;

// ─── Storage Keys ────────────────────────────────────────────────────────────

/**
 * Session storage key used to persist authenticated session data.
 */
export const SESSION_STORAGE_KEY = 'stellar_insured_session';

/**
 * Local storage key for wallet-related application state.
 */
export const WALLET_STORE_KEY = 'wallet-store';

// ─── Pagination & Filtering Defaults ─────────────────────────────────────────

/**
 * Default minimum premium value when initializing policy filters.
 */
export const DEFAULT_PREMIUM_MIN = 0;

/**
 * Default maximum premium value when initializing policy filters.
 */
export const DEFAULT_PREMIUM_MAX = 1_000;

/**
 * Default minimum deductible value for policy searches.
 */
export const DEFAULT_DEDUCTIBLE_MIN = 0;

/**
 * Default maximum deductible value for policy searches.
 */
export const DEFAULT_DEDUCTIBLE_MAX = 10_000;

// ─── Miscellaneous Constants ─────────────────────────────────────────────────

/**
 * Maximum chunk size used when signing large payloads with Freighter.
 * Prevents issues with wallet message size limitations.
 */
export const FREIGHTER_CHUNK_SIZE = 0x8000; // 32,768 bytes

/**
 * Flat processing fee applied during policy-related transactions.
 * Consider moving to backend configuration if this value may change.
 */
export const FIXED_PROCESSING_FEE = 50;