const ACCESS_TOKEN_KEY = 'accessToken';
const ACCESS_TOKEN_EVENT = 'access-token-change';

function emitAccessTokenChange() {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new Event(ACCESS_TOKEN_EVENT));
}

export function getAccessToken() {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    emitAccessTokenChange();
}

export function clearAccessToken() {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    emitAccessTokenChange();
}

export function subscribeToAccessToken(onStoreChange: () => void) {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const handleStorage = (event: StorageEvent) => {
        if (event.key === ACCESS_TOKEN_KEY) {
            onStoreChange();
        }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(ACCESS_TOKEN_EVENT, onStoreChange);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(ACCESS_TOKEN_EVENT, onStoreChange);
    };
}

export { ACCESS_TOKEN_KEY };
