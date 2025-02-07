class ErrorService {
    static init() {
        // Global hata yakalayıcı
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(error || message);
            return false;
        };

        // Promise hataları için
        window.onunhandledrejection = (event) => {
            this.handleError(event.reason);
        };
    }

    static handleError(error) {
        // Hata tipine göre özelleştirilmiş mesajlar
        const errorMessage = this.getErrorMessage(error);
        
        // Hata loglama veya raporlama servisi buraya eklenebilir
        console.error('Error caught:', error);

        // Toast notification göster
        if (window.showToast) {
            window.showToast({
                type: 'error',
                message: errorMessage
            });
        }
    }

    static getErrorMessage(error) {
        if (error?.response?.data?.detail) {
            return error.response.data.detail;
        }

        switch (error?.name) {
            case 'NetworkError':
                return 'Network connection error. Please check your internet connection.';
            case 'TimeoutError':
                return 'Request timed out. Please try again.';
            case 'AbortError':
                return 'Request was cancelled.';
            default:
                if (error?.message) {
                    return error.message;
                }
                return 'An unexpected error occurred.';
        }
    }

    static formatApiError(error) {
        if (error.response) {
            // API'den dönen hata
            const status = error.response.status;
            const detail = error.response.data?.detail;

            switch (status) {
                case 400:
                    return 'Invalid request. Please check your input.';
                case 401:
                    return 'Authentication required. Please log in.';
                case 403:
                    return 'You do not have permission to perform this action.';
                case 404:
                    return 'The requested resource was not found.';
                case 409:
                    return 'There was a conflict with the current state.';
                case 422:
                    return 'Validation error. Please check your input.';
                case 429:
                    return 'Too many requests. Please try again later.';
                case 500:
                    return 'An internal server error occurred. Please try again later.';
                default:
                    return detail || `Server error (${status}). Please try again later.`;
            }
        }

        if (error.request) {
            // İstek gönderildi ama cevap alınamadı
            return 'No response from server. Please check your connection.';
        }

        // İstek oluşturulmadan hata oluştu
        return error.message || 'An unexpected error occurred.';
    }

    // Retry mekanizması
    static async retryOperation(operation, maxRetries = 3, delay = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) {
                    break;
                }

                // Exponential backoff
                await new Promise(resolve => 
                    setTimeout(resolve, delay * Math.pow(2, attempt - 1))
                );
            }
        }

        throw lastError;
    }
}

export default ErrorService;