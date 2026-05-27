import { getAccessToken } from '@/shared/lib/auth/index';

type RequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
};

export class ApiError extends Error {
    status: number;
    validationErrors?: Record<string, string>;

    constructor(
        message: string,
        status: number,
        validationErrors?: Record<string, string>,
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.validationErrors = validationErrors;
    }
}

export async function apiClient<T>(path: string, options: RequestOptions = {}) {
    const { body, headers, ...restOptions } = options;
    const token = getAccessToken();
    const requestHeaders = new Headers(headers);

    if (
        !requestHeaders.has('Content-Type') &&
        body &&
        !(body instanceof FormData)
    ) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(path, {
        ...restOptions,
        headers: requestHeaders,
        body:
            body && !(body instanceof FormData) && typeof body !== 'string'
                ? JSON.stringify(body)
                : (body as BodyInit | null | undefined),
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        let validationErrors: Record<string, string> | undefined;
        const contentType = response.headers.get('content-type') ?? '';

        try {
            if (contentType.includes('application/json')) {
                const data = (await response.json()) as {
                    message?: string;
                    error?: string;
                    validationErrors?: Record<string, string>;
                };

                if (data.message) {
                    message = data.message;
                } else if (data.error) {
                    message = data.error;
                }

                if (data.validationErrors) {
                    validationErrors = data.validationErrors;
                    const firstValidationEntry = Object.entries(
                        data.validationErrors,
                    )[0];

                    if (firstValidationEntry) {
                        const [fieldName, fieldMessage] = firstValidationEntry;
                        message = `${fieldName}: ${fieldMessage}`;
                    }
                }
            } else {
                const text = (await response.text()).trim();

                if (text) {
                    message = text.slice(0, 300);
                }
            }
        } catch {}

        throw new ApiError(message, response.status, validationErrors);
    }

    if (response.status === 204) {
        return null as T;
    }

    return (await response.json()) as T;
}
