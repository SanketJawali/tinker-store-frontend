import { showToast } from './toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Default timeout: 25 seconds (accommodates cold starts + buffer)
const DEFAULT_TIMEOUT = 25000;

// Critical operations (like checkout) can use a longer timeout
const CRITICAL_TIMEOUT = 30000;

export interface FetchWithTimeoutOptions extends RequestInit {
    timeout?: number;
    showErrorToast?: boolean; // Whether to automatically show error toast
    retryOnTimeout?: boolean; // Future: implement retry logic
}

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errorCode?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class TimeoutError extends Error {
    constructor(message: string = 'Request timed out') {
        super(message);
        this.name = 'TimeoutError';
    }
}

/**
 * Fetch wrapper with timeout and standardized error handling
 * @param url The URL to fetch
 * @param options Fetch options with additional timeout configuration
 * @returns Promise resolving to Response object
 */
export async function fetchWithTimeout(
    url: string,
    options: FetchWithTimeoutOptions = {}
): Promise<Response> {
    const {
        timeout = DEFAULT_TIMEOUT,
        showErrorToast = true,
        ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);

        // Handle timeout/abort
        if (error.name === 'AbortError') {
            const timeoutError = new TimeoutError(
                `Request timed out after ${timeout / 1000} seconds. The server might be experiencing issues or cold starting.`
            );
            
            if (showErrorToast) {
                showToast(
                    'Request timed out. Please try again or check if the server is running.',
                    'error',
                    10000 // 10 seconds - long enough for users to notice
                );
            }
            
            throw timeoutError;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            const networkError = new ApiError(
                'Network error. Please check your internet connection.',
                0
            );
            
            if (showErrorToast) {
                showToast('Network error. Please check your connection.', 'error', 8000); // 8 seconds
            }
            
            throw networkError;
        }

        // Re-throw other errors
        throw error;
    }
}

/**
 * Helper to parse JSON response with error handling
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
    try {
        return await response.json();
    } catch (error) {
        throw new ApiError('Failed to parse response as JSON', response.status);
    }
}

/**
 * Check the health of the backend server
 * @returns Health check response or null if check fails
 */
export async function checkBackendHealth(): Promise<{
    status: string;
    database: { ok: boolean; error: string | null };
    cache: { ok: boolean; error: string | null };
} | null> {
    try {
        const response = await fetchWithTimeout(`${BACKEND_URL}/`, {
            timeout: 20000, // 10 second timeout for health check
            showErrorToast: false, // Don't show toast for health checks
        });

        if (!response.ok) {
            console.error('Health check failed:', response.status);
            return null;
        }

        const data = await parseJsonResponse<{
            status: string;
            uptime_seconds: number;
            database: { ok: boolean; error: string | null };
            cache: { ok: boolean; error: string | null; hits?: number; misses?: number };
        }>(response);

        return {
            status: data.status,
            database: data.database,
            cache: data.cache,
        };
    } catch (error) {
        console.error('Health check error:', error);
        return null;
    }
}

/**
 * Validate health check response and show errors if any
 * @param health Health check response
 * @returns true if healthy, false otherwise
 */
export function validateHealth(health: {
    status: string;
    database: { ok: boolean; error: string | null };
    cache: { ok: boolean; error: string | null };
} | null): boolean {
    if (!health) {
        showToast('Unable to connect to the server. Please try again later.', 'error', 6000);
        return false;
    }

    const errors: string[] = [];

    if (health.status !== 'ok') {
        errors.push(`Server status: ${health.status}`);
    }

    if (!health.database.ok) {
        errors.push(`Database error: ${health.database.error || 'Unknown database issue'}`);
    }

    if (!health.cache.ok) {
        errors.push(`Cache error: ${health.cache.error || 'Unknown cache issue'}`);
    }

    if (errors.length > 0) {
        showToast(
            `⚠️ Server Error: ${errors.join(', ')}. This is a backend issue, not a problem with your connection.`,
            'error',
            10000 // 10 seconds - give users time to read server error details
        );
        return false;
    }

    return true;
}

// Export constants for use in specific cases
export { BACKEND_URL, DEFAULT_TIMEOUT, CRITICAL_TIMEOUT };
