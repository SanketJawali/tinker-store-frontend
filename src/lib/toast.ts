/**
 * Toast notification utility for showing user feedback messages
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number; // milliseconds
}

/**
 * Show a toast notification to the user
 * @param message The message to display
 * @param type The type of toast (success, error, info, warning)
 * @param duration How long to show the toast in milliseconds (default: 4000)
 */
export const showToast = (
    message: string, 
    type: ToastType = 'info',
    duration: number = 4000
) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg fixed top-20 right-4 z-50 max-w-sm animate-slide-in`;
    toast.innerHTML = `
        <div>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/**
 * Convenience methods for specific toast types
 */
export const toast = {
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
};
